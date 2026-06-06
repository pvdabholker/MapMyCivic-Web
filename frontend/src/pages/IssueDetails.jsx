import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

import {
  FaCamera,
  FaArrowLeft,
  FaPen
} from "react-icons/fa";

import { IoLocationOutline } from "react-icons/io5";
import { MdAccessTime } from "react-icons/md";

function IssueDetail() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");

  // EDIT MODE
  const [editingStatus, setEditingStatus] = useState(false);

  // ================= FETCH ISSUE =================
  useEffect(() => {

    const fetchIssue = async () => {

      try {

        const token = localStorage.getItem("token");

        const payload = JSON.parse(atob(token.split(".")[1]));

        setRole(payload.role);

        const res = await fetch("http://127.0.0.1:8000/report/", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();

        const found = data.find(r => r.id === id);

        setIssue(found);
        setStatus(found.status);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);

      }

    };

    fetchIssue();

  }, [id]);

  // ================= UPDATE STATUS =================
  const updateStatus = async () => {

    try {

      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://127.0.0.1:8000/report/${id}?status=${status}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      setIssue(data);

      setEditingStatus(false);

      alert("Status updated successfully ✅");

    } catch (err) {

      console.error(err);

      alert("Failed to update status");

    }

  };

  // ================= STATUS COLORS =================
  const getStatusStyle = (status) => {

    if (status === "pending") {
      return "bg-red-500";
    }

    if (status === "in_progress") {
      return "bg-lime-500";
    }

    if (status === "resolved") {
      return "bg-green-500";
    }

    return "bg-gray-500";

  };

  // ================= LOADING =================
  if (loading) {

    return (

      <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100">

        <Navbar />

        <div className="flex justify-center items-center h-[80vh]">

          <div className="bg-white/80 backdrop-blur-xl border border-emerald-200 px-10 py-6 rounded-3xl shadow-2xl">

            <div className="flex items-center gap-4">

              <div className="w-5 h-5 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>

              <p className="text-lg font-semibold text-emerald-700">
                Loading issue...
              </p>

            </div>

          </div>

        </div>

      </div>

    );

  }

  // ================= ISSUE NOT FOUND =================
  if (!issue) {

    return (

      <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100">

        <Navbar />

        <div className="flex justify-center items-center h-[80vh]">

          <div className="bg-white/80 backdrop-blur-xl border border-emerald-200 px-12 py-10 rounded-[36px] shadow-2xl text-center">

            <div className="text-6xl mb-4">
              ⚠️
            </div>

            <h2 className="text-3xl font-bold text-slate-700 mb-2">
              Issue Not Found
            </h2>

            <p className="text-slate-500">
              The requested issue could not be found
            </p>

          </div>

        </div>

      </div>

    );

  }

  const formattedTime = new Date(issue.created_at).toLocaleString();

  return (

    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100">

      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-emerald-700 font-semibold mb-6 hover:text-emerald-900 transition"
        >
          <FaArrowLeft />
          Back
        </button>

        {/* MAIN CARD */}
        <div className="bg-white/75 backdrop-blur-xl border border-emerald-200 rounded-[36px] p-8 shadow-xl">

          {/* TAGS */}
          <div className="flex flex-wrap gap-3 mb-5">

            <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-semibold border border-emerald-200">
              {issue.issue_type}
            </span>

            {/* STATUS WITH PEN */}
            <div className="flex items-center gap-2">

              <span
                className={`px-4 py-1.5 rounded-full text-sm text-white font-semibold ${getStatusStyle(issue.status)}`}
              >
                {issue.status}
              </span>

              {/* EDIT BUTTON */}
              {role === "parent" && (

                <button
                  onClick={() => setEditingStatus(!editingStatus)}
                  className="w-9 h-9 rounded-full bg-white border border-emerald-200 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition shadow-sm"
                >
                  <FaPen size={12} />
                </button>

              )}

            </div>

          </div>

          {/* STATUS EDITOR */}
          {editingStatus && role === "parent" && (

            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 mb-8 flex flex-col md:flex-row gap-4 items-center">

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex-1 w-full p-4 rounded-2xl border border-emerald-200 bg-white outline-none focus:ring-4 focus:ring-emerald-200 text-slate-700"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>

              <button
                onClick={updateStatus}
                className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-7 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-emerald-300/40 hover:scale-[1.02] transition-all duration-300"
              >
                Save
              </button>

            </div>

          )}

          {/* TITLE */}
          <h1 className="text-5xl font-extrabold text-emerald-600 mb-8 leading-tight">
            {issue.issue_type}
          </h1>

          {/* INFO GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">

            <div className="bg-white/70 border border-emerald-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">

              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 text-xl">
                <IoLocationOutline />
              </div>

              <div>

                <p className="text-sm text-slate-400">
                  Location
                </p>

                <p className="font-semibold text-slate-700">
                  {issue.address}
                </p>

              </div>

            </div>

            <div className="bg-white/70 border border-emerald-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">

              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 text-xl">
                <MdAccessTime />
              </div>

              <div>

                <p className="text-sm text-slate-400">
                  Reported Time
                </p>

                <p className="font-semibold text-slate-700">
                  {formattedTime}
                </p>

              </div>

            </div>

            <div className="bg-white/70 border border-emerald-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">

              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-xl">
                🏢
              </div>

              <div>

                <p className="text-sm text-slate-400">
                  Department
                </p>

                <p className="font-semibold text-emerald-700">
                  {issue.department}
                </p>

              </div>

            </div>

            <div className="bg-white/70 border border-emerald-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">

              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-xl">
                📷
              </div>

              <div>

                <p className="text-sm text-slate-400">
                  Attachments
                </p>

                <p className="font-semibold text-slate-700">
                  1 Image
                </p>

              </div>

            </div>

          </div>

          {/* DESCRIPTION */}
          <div className="mb-10">

            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              Description
            </h2>

            <p className="text-slate-600 text-lg leading-relaxed">
              {issue.description}
            </p>

          </div>

          {/* IMAGE */}
          <div>

            <h2 className="text-2xl font-bold text-slate-800 mb-5">
              Captured Image
            </h2>

            <div className="flex justify-center">

              {issue.image_url ? (

                <div className="overflow-hidden rounded-[28px] shadow-xl border border-emerald-100 bg-white">

                  <img
                    src={issue.image_url}
                    alt="issue"
                    className="max-h-[500px] object-contain hover:scale-[1.02] transition duration-500"
                  />

                </div>

              ) : (

                <div className="h-72 w-72 bg-white border border-emerald-200 rounded-[32px] flex flex-col items-center justify-center text-slate-400 shadow-lg">

                  <FaCamera size={40} />

                  <p className="mt-3 text-lg">
                    No Image
                  </p>

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

    </div>

  );
}

export default IssueDetail;