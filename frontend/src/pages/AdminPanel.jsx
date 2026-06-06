import { useEffect, useState } from "react";

import StatsLineChart from "../components/StatsLineChart";
import IssuePieChart from "../components/IssuePieChart";
import Navbar from "../components/Navbar";

function AdminPanel() {

  const [issues, setIssues] = useState([]);
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

        setIssues(Array.isArray(data) ? data : []);

      } catch (err) {

        console.error("Error fetching reports:", err);

      } finally {

        setLoading(false);

      }

    };

    fetchReports();

  }, []);

  // ================= COUNTS =================
  const total = issues.length;

  const resolved = issues.filter(
    i => i.status === "resolved"
  ).length;

  const progress = issues.filter(
    i => i.status === "in_progress"
  ).length;

  const pending = total - resolved - progress;

  // ================= DEPARTMENTS =================
  const departments = {};

  issues.forEach(issue => {

    if (!departments[issue.department]) {

      departments[issue.department] = {
        total: 0,
        resolved: 0
      };

    }

    departments[issue.department].total++;

    if (issue.status === "resolved") {
      departments[issue.department].resolved++;
    }

  });

  // ================= CATEGORIES =================
  const categories = {};

  issues.forEach(issue => {

    const category = issue.issue_type;

    if (!categories[category]) {
      categories[category] = 0;
    }

    categories[category]++;

  });

  // ================= CRITICAL ISSUES =================
  const criticalIssues = issues.filter(
    issue => issue.severity === "critical"
  );

  // ================= PIE DATA =================
  const pieStats = {
    resolved: resolved,
    pending: pending,
    progress: progress
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
                Loading Dashboard...
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

          <p className="text-sm mb-2 text-green-100">
            Agency Admin Panel
          </p>

          <h1 className="text-4xl font-extrabold mb-2">
            Administrative Dashboard
          </h1>

          <p className="text-green-100 text-lg">
            Manage and track civic issues across all departments
          </p>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

          <div className="bg-white/75 backdrop-blur-xl border border-emerald-200 rounded-[30px] p-6 shadow-lg">

            <p className="text-slate-500 mb-2">
              Total Issues
            </p>

            <h2 className="text-4xl font-extrabold text-emerald-600">
              {total}
            </h2>

          </div>

          <div className="bg-white/75 backdrop-blur-xl border border-green-200 rounded-[30px] p-6 shadow-lg">

            <p className="text-slate-500 mb-2">
              Resolved
            </p>

            <h2 className="text-4xl font-extrabold text-green-500">
              {resolved}
            </h2>

          </div>

          <div className="bg-white/75 backdrop-blur-xl border border-lime-200 rounded-[30px] p-6 shadow-lg">

            <p className="text-slate-500 mb-2">
              In Progress
            </p>

            <h2 className="text-4xl font-extrabold text-lime-500">
              {progress}
            </h2>

          </div>

          <div className="bg-white/75 backdrop-blur-xl border border-red-200 rounded-[30px] p-6 shadow-lg">

            <p className="text-slate-500 mb-2">
              Pending
            </p>

            <h2 className="text-4xl font-extrabold text-red-500">
              {pending}
            </h2>

          </div>

        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">

          {/* LINE CHART */}
          <div className="bg-white/75 backdrop-blur-xl border border-emerald-200 rounded-[36px] p-6 shadow-xl">

            <h2 className="text-2xl font-bold text-slate-800 mb-5">
              Issue Statistics
            </h2>

            <StatsLineChart
              issues={issues.map(issue => ({
                date: new Date(issue.created_at).toLocaleDateString(),

                status:
                  issue.status === "resolved"
                    ? "Resolved"
                    : issue.status === "in_progress"
                    ? "In Progress"
                    : "Pending"
              }))}
            />

          </div>

          {/* PIE CHART */}
          <div className="bg-white/75 backdrop-blur-xl border border-emerald-200 rounded-[36px] p-6 shadow-xl">

            <h2 className="text-2xl font-bold text-slate-800 mb-5">
              Issue Distribution
            </h2>

            <IssuePieChart data={pieStats} />

          </div>

        </div>

        {/* PERFORMANCE + CATEGORY */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">

          {/* PERFORMANCE */}
          <div className="bg-white/75 backdrop-blur-xl border border-emerald-200 rounded-[36px] p-7 shadow-xl">

            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Agency Performance
            </h2>

            {Object.keys(departments).map(dep => {

              const total = departments[dep].total;

              const resolved = departments[dep].resolved;

              const percent = total > 0
                ? (resolved / total) * 100
                : 0;

              return (

                <div key={dep} className="mb-6">

                  <div className="flex justify-between text-sm mb-2">

                    <span className="font-semibold text-slate-700">
                      {dep}
                    </span>

                    <span className="text-emerald-600 font-semibold">
                      {resolved}/{total} resolved
                    </span>

                  </div>

                  <div className="w-full bg-emerald-100 h-3 rounded-full overflow-hidden">

                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full"
                      style={{ width: `${percent}%` }}
                    ></div>

                  </div>

                </div>

              );

            })}

          </div>

          {/* CATEGORY */}
          <div className="bg-white/75 backdrop-blur-xl border border-emerald-200 rounded-[36px] p-7 shadow-xl">

            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Issues by Category
            </h2>

            {Object.keys(categories).map(cat => (

              <div
                key={cat}
                className="flex justify-between items-center mb-5"
              >

                <span className="font-semibold text-slate-700">
                  {cat}
                </span>

                <div className="flex items-center gap-3">

                  <div className="w-32 bg-emerald-100 h-3 rounded-full overflow-hidden">

                    <div
                      className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full"
                      style={{
                        width: `${categories[cat] * 20}px`
                      }}
                    ></div>

                  </div>

                  <span className="font-bold text-emerald-700">
                    {categories[cat]}
                  </span>

                </div>

              </div>

            ))}

          </div>

        </div>

        {/* CRITICAL ISSUES */}
        <div className="bg-white/75 backdrop-blur-xl border border-red-200 rounded-[36px] p-7 shadow-xl">

          <h2 className="text-2xl font-bold mb-6 text-red-600">
            Critical Issues Requiring Attention
          </h2>

          {criticalIssues.length === 0 ? (

            <p className="text-slate-500">
              No critical issues found
            </p>

          ) : (

            <div className="space-y-4">

              {criticalIssues.map(issue => (

                <div
                  key={issue.id}
                  className="border border-red-200 bg-red-50/80 backdrop-blur-lg p-5 rounded-3xl flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >

                  <div>

                    <p className="text-xl font-bold text-red-700 mb-1">
                      {issue.issue_type}
                    </p>

                    <p className="text-slate-600">
                      {issue.address} • {issue.department}
                    </p>

                  </div>

                  <span className="text-red-500 text-sm font-semibold">
                    {new Date(issue.created_at).toLocaleString()}
                  </span>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>

  );
}

export default AdminPanel;