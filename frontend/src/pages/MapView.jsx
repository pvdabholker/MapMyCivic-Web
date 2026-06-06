import Navbar from "../components/Navbar";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

function MapView() {

  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://127.0.0.1:8000/report/", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error("Failed to fetch reports");
        }

        const data = await res.json();

        console.log("Fetched Reports:", data);

        setReports(data);

      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // ================= STATUS COLORS =================
  const getColor = (status) => {
    if (status === "pending") return "red";
    if (status === "in_progress") return "orange";
    if (status === "resolved") return "green";
    return "gray";
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100">

        <div className="bg-white/80 backdrop-blur-xl border border-emerald-200 px-8 py-6 rounded-3xl shadow-2xl">

          <div className="flex items-center gap-4">

            <div className="w-5 h-5 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>

            <p className="text-lg font-semibold text-emerald-700">
              Loading map...
            </p>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100">

      <Navbar />

      <div className="px-8 py-8">

        {/* HEADER */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white p-10 rounded-3xl mb-8 shadow-2xl">

          <div className="absolute top-0 right-0 w-72 h-72 bg-white/20 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-green-200/20 blur-3xl rounded-full"></div>

          <h1 className="text-4xl font-extrabold mb-3">
            Map View
          </h1>

          <p className="text-green-100 text-lg">
            View all reported issues on the city map
          </p>

        </div>

        {/* MAP CONTAINER */}
        <div className="bg-white/70 backdrop-blur-xl border border-emerald-200 rounded-3xl overflow-hidden shadow-2xl">

          <MapContainer
            center={[20, 75]}
            zoom={5}
            style={{ height: "550px", width: "100%" }}
          >

            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* ================= MARKERS ================= */}
            {reports
              .filter(r => r.latitude && r.longitude)
              .map((report) => {

                const lat = Number(report.latitude);
                const lng = Number(report.longitude);

                if (isNaN(lat) || isNaN(lng)) return null;

                return (
                  <CircleMarker
                    key={report.id}
                    center={[lat, lng]}
                    radius={8}
                    pathOptions={{
                      color: getColor(report.status),
                      fillColor: getColor(report.status),
                      fillOpacity: 0.9
                    }}
                  >

                    <Popup>
                      <div className="space-y-2">

                        <h3 className="font-bold text-slate-800">
                          {report.issue_type}
                        </h3>

                        <p className="text-sm text-gray-600">
                          {report.address}
                        </p>

                        <p className="text-xs text-gray-500">
                          Status: {report.status}
                        </p>

                        <button
                          onClick={() => navigate(`/issue/${report.id}`)}
                          className="text-emerald-600 text-sm font-semibold mt-1 hover:text-emerald-700"
                        >
                          View Details
                        </button>

                      </div>
                    </Popup>

                  </CircleMarker>
                );
              })}

          </MapContainer>

        </div>

        {/* LEGEND */}
        <div className="mt-6 bg-white/70 backdrop-blur-xl border border-emerald-200 rounded-2xl px-6 py-4 shadow-lg flex flex-wrap gap-8 text-sm">

          <div className="flex items-center gap-3">

            <div className="w-4 h-4 bg-red-500 rounded-full shadow"></div>

            <span className="text-slate-700 font-medium">
              Pending
            </span>

          </div>

          <div className="flex items-center gap-3">

            <div className="w-4 h-4 bg-orange-400 rounded-full shadow"></div>

            <span className="text-slate-700 font-medium">
              In Progress
            </span>

          </div>

          <div className="flex items-center gap-3">

            <div className="w-4 h-4 bg-green-500 rounded-full shadow"></div>

            <span className="text-slate-700 font-medium">
              Resolved
            </span>

          </div>

        </div>

      </div>
    </div>
  );
}

export default MapView;