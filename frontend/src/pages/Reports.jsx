import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Reports() {

  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH REPORTS =================
  useEffect(() => {

    const fetchReports = async () => {

      try {

        const token = localStorage.getItem("token");

        const res = await fetch("http://127.0.0.1:8000/report/", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // INVALID TOKEN
        if (res.status === 401) {

          localStorage.removeItem("token");

          window.location.href = "/signin";

          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch reports");
        }

        const data = await res.json();

        setReports(Array.isArray(data) ? data : []);

      } catch (err) {

        console.error("Error fetching reports:", err);

      } finally {

        setLoading(false);

      }

    };

    fetchReports();

  }, []);

  // ================= STATUS COLORS =================
  const getStatusColor = (status) => {

    if (status === "pending") {
      return "bg-red-400";
    }

    if (status === "in_progress") {
      return "bg-lime-500";
    }

    if (status === "resolved") {
      return "bg-green-500";
    }

    return "bg-gray-400";

  };

  // ================= STATUS TEXT =================
  const formatStatus = (status) => {

    if (status === "in_progress") {
      return "In Progress";
    }

    if (status === "resolved") {
      return "Resolved";
    }

    return "Pending";

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
                Loading reports...
              </p>

            </div>

          </div>

        </div>

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100">

      <Navbar />

      <div className="px-6 py-8">

        {/* HEADER */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white p-8 rounded-[36px] mb-8 shadow-2xl">

          <div className="absolute top-0 right-0 w-72 h-72 bg-white/20 blur-3xl rounded-full"></div>

          <div className="absolute bottom-0 left-0 w-72 h-72 bg-green-200/20 blur-3xl rounded-full"></div>

          <h1 className="text-4xl font-extrabold mb-3">
            Issue Reports Log
          </h1>

          <p className="text-green-100 text-lg">
            Complete log of all detected civic issues
          </p>

        </div>

        {/* EMPTY STATE */}
        {reports.length === 0 ? (

          <div className="bg-white/80 backdrop-blur-xl border border-emerald-200 rounded-[36px] shadow-xl p-16 text-center">

            <div className="text-7xl mb-5">
              📭
            </div>

            <h2 className="text-3xl font-bold text-slate-700 mb-3">
              No Issues Found
            </h2>

            <p className="text-slate-500 text-lg">
              No civic issues have been reported yet
            </p>

          </div>

        ) : (

          /* REPORT CARDS */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

            {reports.map((report) => (

              <div
                key={report.id}
                onClick={() => navigate(`/issue/${report.id}`)}
                className="bg-[#dcfce7] border border-emerald-200 rounded-[22px] p-4 shadow-sm hover:shadow-lg hover:bg-[#d1fae5] transition-all duration-300 cursor-pointer"
              >

                {/* TOP TAGS */}
                <div className="flex items-center justify-between mb-3">

                  <div className="flex flex-wrap gap-2">

                    {/* ISSUE TYPE */}
                    <span className="bg-white text-slate-700 px-3 py-[5px] rounded-full text-[11px] font-medium shadow-sm">

                      {report.issue_type}

                    </span>

                    {/* CRITICAL */}
                    <span className="bg-red-500 text-white px-3 py-[5px] rounded-full text-[11px] font-medium">

                      Critical

                    </span>

                    {/* STATUS */}
                    <span
                      className={`px-3 py-[5px] rounded-full text-[11px] text-white font-medium ${getStatusColor(report.status)}`}
                    >

                      {formatStatus(report.status)}

                    </span>

                  </div>

                </div>

                {/* MAIN CONTENT */}
                <div className="flex gap-3">

                  {/* IMAGE */}
                  <div className="w-[95px] h-[95px] rounded-[18px] overflow-hidden flex-shrink-0 bg-white border border-emerald-100">

                    {report.image_url ? (

                      <img
                        src={report.image_url}
                        alt="issue"
                        className="w-full h-full object-cover"
                      />

                    ) : (

                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">

                        No Image

                      </div>

                    )}

                  </div>

                  {/* RIGHT SIDE */}
                  <div className="flex-1 min-w-0">

                    {/* TITLE */}
                    <h2 className="text-2xl font-bold text-[#21392f] mb-2 leading-tight line-clamp-1">

                      {report.issue_type}

                    </h2>

                    {/* VALID ISSUE */}
                    <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium mb-2">

                      <span>
                        ✅
                      </span>

                      <span>
                        Valid Issue
                      </span>

                    </div>

                    {/* DESCRIPTION */}
                    <p className="text-slate-500 text-sm mb-2 line-clamp-2">

                      {report.description}

                    </p>

                    {/* LOCATION */}
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">

                      <span>
                        📍
                      </span>

                      <span className="line-clamp-1">

                        {report.address || "Unknown Location"}

                      </span>

                    </div>

                    {/* DATE */}
                    <div className="flex items-center gap-1 text-xs text-emerald-700">

                      <span>
                        ⏰
                      </span>

                      <span>

                        {report.created_at
                          ? new Date(report.created_at).toLocaleDateString()
                          : "No Date"}

                      </span>

                    </div>

                  </div>

                </div>

                {/* DEPARTMENT */}
                <div className="mt-4 text-lg font-semibold text-[#21392f] line-clamp-1">

                  {report.department}

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );
}

export default Reports;