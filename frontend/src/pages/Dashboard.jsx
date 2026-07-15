import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap
} from "react-leaflet";

import "leaflet/dist/leaflet.css";


// ================= AUTO CENTER =================
function ChangeMapCenter({ center }) {

  const map = useMap();

  map.setView(center, 15);

  return null;

}

function Dashboard() {

  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const categories = ["All", "Potholes", "Streetlight", "Garbage", "Water Logging", "Other"];

  // ================= FETCH =================
  useEffect(() => {

    const fetchReports = async () => {

      try {

        const token = localStorage.getItem("token");

        const res = await fetch("http://127.0.0.1:8000/report/", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

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

  // ================= STATUS COLOR =================
  const getColor = (status) => {

    if (status === "pending") return "red";

    if (status === "in_progress") return "orange";

    if (status === "resolved") return "green";

    return "gray";

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

  // ================= FILTER =================
  const filteredIssues = issues.filter((issue) => {

    const matchCategory =
      filter === "All" || issue.issue_type === filter;


    const matchSearch =
      issue.issue_type?.toLowerCase().includes(search.toLowerCase()) ||
      issue.address?.toLowerCase().includes(search.toLowerCase());

    return matchCategory && matchSearch;

  });

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
                Loading dashboard...
              </p>

            </div>

          </div>

        </div>

      </div>

    );

  }

  // ================= VALID LAT LONG =================
  const validIssues = issues.filter(
    (i) =>
      i.latitude !== null &&
      i.longitude !== null &&
      !isNaN(parseFloat(i.latitude)) &&
      !isNaN(parseFloat(i.longitude))
  );

  // ================= MAP CENTER =================
  const mapCenter =
    validIssues.length > 0
      ? [
          parseFloat(validIssues[0].latitude),
          parseFloat(validIssues[0].longitude)
        ]
      : [19.0760, 72.8777];

  return (

    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 text-slate-900">

      <Navbar />

      <div className="px-6 py-8">

        {/* HEADER */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-[36px] mb-8 p-8 shadow-2xl">

          <div className="absolute top-0 right-0 w-72 h-72 bg-white/20 blur-3xl rounded-full"></div>

          <div className="absolute bottom-0 left-0 w-72 h-72 bg-green-200/30 blur-3xl rounded-full"></div>

          <h1 className="text-4xl font-extrabold mb-3 text-white">
            Civic Issues Dashboard
          </h1>

          <p className="text-green-100 text-lg">
            Real-time monitoring of civic issues detected across the city
          </p>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          {/* TOTAL */}
          <div className="bg-[#dcfce7] border border-emerald-200 rounded-[22px] p-5 shadow-sm hover:shadow-lg transition-all duration-300">

            <p className="text-slate-600 mb-2 text-sm font-medium">
              Total Issues
            </p>

            <h2 className="text-3xl font-bold text-emerald-600">
              {issues.length}
            </h2>

          </div>

          {/* RESOLVED */}
          <div className="bg-[#dcfce7] border border-green-200 rounded-[22px] p-5 shadow-sm hover:shadow-lg transition-all duration-300">

            <p className="text-slate-600 mb-2 text-sm font-medium">
              Resolved
            </p>

            <h2 className="text-green-500 text-3xl font-bold">
              {issues.filter(i => i.status === "resolved").length}
            </h2>

          </div>

          {/* IN PROGRESS */}
          <div className="bg-[#dcfce7] border border-lime-200 rounded-[22px] p-5 shadow-sm hover:shadow-lg transition-all duration-300">

            <p className="text-slate-600 mb-2 text-sm font-medium">
              In Progress
            </p>

            <h2 className="text-lime-500 text-3xl font-bold">
              {issues.filter(i => i.status === "in_progress").length}
            </h2>

          </div>

          {/* PENDING */}
          <div className="bg-[#dcfce7] border border-red-200 rounded-[22px] p-5 shadow-sm hover:shadow-lg transition-all duration-300">

            <p className="text-slate-600 mb-2 text-sm font-medium">
              Pending
            </p>

            <h2 className="text-red-500 text-3xl font-bold">
              {issues.filter(i => i.status === "pending").length}
            </h2>

          </div>

        </div>

        {/* MAP */}
        <h2 className="text-2xl font-bold mb-4 text-emerald-700">
          Issue Locations
        </h2>

        <div className="rounded-[28px] overflow-hidden border border-emerald-200 shadow-xl bg-[#dcfce7] mb-10">

          <MapContainer
            center={mapCenter}
            zoom={15}
            style={{ height: "420px", width: "100%" }}
          >

            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <ChangeMapCenter center={mapCenter} />

            {validIssues.map((issue) => (

              <CircleMarker
                key={issue.id}
                center={[
                  parseFloat(issue.latitude),
                  parseFloat(issue.longitude)
                ]}
                radius={8}
                pathOptions={{
                  color: getColor(issue.status),
                  fillColor: getColor(issue.status),
                  fillOpacity: 0.9
                }}
              >

                <Popup>

                  <div className="space-y-1">

                    <h3 className="font-semibold">
                      {issue.issue_type}
                    </h3>

                    <p className="text-sm text-gray-600">
                      {issue.address}
                    </p>

                    <p className="text-xs text-gray-500">
                      Status: {formatStatus(issue.status)}
                    </p>

                    <button
                      onClick={() => navigate(`/issue/${issue.id}`)}
                      className="text-emerald-600 text-sm mt-1"
                    >
                      View Details
                    </button>

                  </div>

                </Popup>

              </CircleMarker>

            ))}

          </MapContainer>

        </div>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search issues..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-4 bg-[#dcfce7] border border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 rounded-2xl mb-6 text-slate-800 placeholder-slate-400 outline-none transition-all shadow-sm"
        />

        {/* FILTER */}
        <div className="flex flex-wrap gap-3 mb-8">

          {categories.map((cat) => (

            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                filter === cat
                  ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg"
                  : "bg-[#dcfce7] text-slate-700 border border-emerald-200 hover:bg-emerald-100"
              }`}
            >

              {cat}

            </button>

          ))}

        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

          {filteredIssues.map((issue) => (

            <div
              key={issue.id}
              onClick={() => navigate(`/issue/${issue.id}`)}
              className="bg-[#dcfce7] border border-emerald-200 rounded-[22px] p-4 shadow-sm hover:shadow-lg hover:bg-[#d1fae5] transition-all duration-300 cursor-pointer"
            >

              {/* TAGS */}
              <div className="flex flex-wrap gap-2 mb-3">

                <span className="bg-white text-slate-700 px-3 py-[5px] rounded-full text-[11px] font-medium shadow-sm">

                  {issue.issue_type}

                </span>

                <span
                  className={`px-3 py-[5px] rounded-full text-[11px] text-white font-medium ${
                    issue.status === "pending"
                      ? "bg-red-500"
                      : issue.status === "in_progress"
                      ? "bg-lime-500"
                      : "bg-green-500"
                  }`}
                >

                  {formatStatus(issue.status)}

                </span>

              </div>

              {/* CONTENT */}
              <div className="flex gap-3">

                {/* IMAGE */}
                <div className="w-[95px] h-[95px] rounded-[18px] overflow-hidden flex-shrink-0 bg-white border border-emerald-100">

                  {issue.image_url ? (

                    <img
                      src={issue.image_url}
                      alt="issue"
                      className="w-full h-full object-cover"
                    />

                  ) : (

                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">

                      No Image

                    </div>

                  )}

                </div>

                {/* RIGHT */}
                <div className="flex-1 min-w-0">

                  <h2 className="text-2xl font-bold text-[#21392f] mb-2 leading-tight line-clamp-1">

                    {issue.issue_type}

                  </h2>

                  <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium mb-2">

                    <span>
                      ✅
                    </span>

                    <span>
                      Valid Issue
                    </span>

                  </div>

                  <p className="text-slate-500 text-sm mb-2 line-clamp-2">

                    {issue.description}

                  </p>

                  <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">

                    <span>
                      📍
                    </span>

                    <span className="line-clamp-1">

                      {issue.address}

                    </span>

                  </div>

                </div>

              </div>

              {/* DEPARTMENT */}
              <div className="mt-4 text-lg font-semibold text-[#21392f] line-clamp-1">

                {issue.department}

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}

export default Dashboard;