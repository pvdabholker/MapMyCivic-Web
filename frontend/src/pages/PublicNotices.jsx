import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";

function PublicNotices() {

  const [notices, setNotices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");

  // ================= FETCH NOTICES =================
  useEffect(() => {
    const fetchNotices = async () => {
      try {

        const res = await fetch("http://127.0.0.1:8000/notice/");
        const data = await res.json();

        setNotices(data);

      } catch (err) {

        console.error("Error fetching notices:", err);

      } finally {

        setLoading(false);

      }
    };

    fetchNotices();
  }, []);

  // ================= STYLE =================
  const getStyle = (priority) => {

    if (priority === "critical") {
      return "border-red-200 bg-red-50/70";
    }

    if (priority === "important") {
      return "border-yellow-200 bg-yellow-50/70";
    }

    return "border-emerald-200 bg-white/70";

  };

  // ================= CREATE NOTICE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const res = await fetch("http://127.0.0.1:8000/notice/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          description,
          department,
          priority
        })
      });

      const newNotice = await res.json();

      setNotices([newNotice, ...notices]);

      // RESET
      setTitle("");
      setDepartment("");
      setDescription("");
      setPriority("normal");
      setShowForm(false);

    } catch (err) {

      console.error("Error creating notice:", err);

    }
  };

  // ================= DELETE =================
  const deleteNotice = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this notice?"
    );

    if (!confirmDelete) return;

    try {

      await fetch(`http://127.0.0.1:8000/notice/${id}`, {
        method: "DELETE"
      });

      setNotices(notices.filter(n => n.id !== id));

    } catch (err) {

      console.error("Delete failed:", err);

    }
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100">

      <Navbar />

      <div className="px-6 py-8">

        {/* HEADER */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white p-8 rounded-[36px] mb-8 shadow-2xl">

          <div className="absolute top-0 right-0 w-72 h-72 bg-white/20 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-green-200/20 blur-3xl rounded-full"></div>

          <h1 className="text-4xl font-extrabold mb-3">
            Public Notices
          </h1>

          <p className="text-green-100 text-lg">
            Government announcements and public notifications
          </p>

        </div>

        {/* CREATE BUTTON */}
        <div className="mb-6">

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-emerald-300/40 hover:scale-[1.02] transition-all duration-300"
          >
            {showForm ? "Close Form" : "Create Notice"}
          </button>

        </div>

        {/* FORM */}
        {showForm && (

          <form
            onSubmit={handleSubmit}
            className="bg-white/75 backdrop-blur-xl border border-emerald-200 p-8 rounded-[36px] shadow-xl mb-8 space-y-5"
          >

            <h2 className="text-3xl font-bold text-emerald-700 mb-2">
              Create New Notice
            </h2>

            <input
              type="text"
              placeholder="Notice Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/80 border border-emerald-200 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-200 text-slate-700"
              required
            />

            <input
              type="text"
              placeholder="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-white/80 border border-emerald-200 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-200 text-slate-700"
              required
            />

            <textarea
              placeholder="Notice Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/80 border border-emerald-200 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-200 text-slate-700 min-h-[140px]"
              required
            />

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-white/80 border border-emerald-200 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-200 text-slate-700"
            >
              <option value="normal">Normal</option>
              <option value="important">Important</option>
              <option value="critical">Critical</option>
            </select>

            <button
              type="submit"
              className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-7 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-emerald-300/40 hover:scale-[1.02] transition-all duration-300"
            >
              Publish Notice
            </button>

          </form>

        )}

        {/* NOTICES */}
        {loading ? (

          <div className="flex justify-center items-center py-20">

            <div className="bg-white/80 backdrop-blur-xl border border-emerald-200 px-10 py-6 rounded-3xl shadow-xl">

              <div className="flex items-center gap-4">

                <div className="w-5 h-5 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>

                <p className="text-lg font-semibold text-emerald-700">
                  Loading notices...
                </p>

              </div>

            </div>

          </div>

        ) : notices.length === 0 ? (

          // EMPTY STATE
          <div className="bg-white/75 backdrop-blur-xl border border-emerald-200 rounded-[36px] shadow-xl p-16 text-center">

            <div className="text-7xl mb-5">
              📭
            </div>

            <h2 className="text-3xl font-bold text-slate-700 mb-3">
              No Notices Available
            </h2>

            <p className="text-slate-500 text-lg">
              There are currently no public notices
            </p>

          </div>

        ) : (

          <div className="space-y-6">

            {notices.map((notice) => (

              <div
                key={notice.id}
                className={`backdrop-blur-lg border p-6 rounded-[32px] shadow-md hover:shadow-xl transition-all duration-300 relative ${getStyle(notice.priority)}`}
              >

                {/* DELETE */}
                <button
                  onClick={() => deleteNotice(notice.id)}
                  className="absolute top-5 right-5 text-red-500 hover:text-red-700 text-xl transition"
                >
                  🗑
                </button>

                <div className="flex gap-5">

                  {/* ICON */}
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl border border-emerald-200">
                    📢
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1">

                    <h3 className="font-bold text-2xl text-slate-800 mb-2">
                      {notice.title}
                    </h3>

                    <div className="text-sm text-slate-500 mb-4">

                      {notice.department} •{" "}
                      {new Date(notice.created_at).toLocaleDateString()}

                    </div>

                    <p className="text-slate-600 text-lg leading-relaxed">
                      {notice.description}
                    </p>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );
}

export default PublicNotices;