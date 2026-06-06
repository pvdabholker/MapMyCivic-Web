import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer
} from "recharts";

function StatsLineChart({ issues }) {

  // Step 1: Group data by date
  const grouped = {};

  issues.forEach(issue => {
    const date = issue.date;

    if (!grouped[date]) {
      grouped[date] = {
        date: date,
        resolved: 0,
        progress: 0
      };
    }

    if (issue.status === "Resolved") {
      grouped[date].resolved++;
    } else if (issue.status === "In Progress") {
      grouped[date].progress++;
    }
  });

  // Step 2: Convert to array
  const data = Object.values(grouped);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">
        Issues Trend (Date-wise)
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />

          <Tooltip />
          <Legend />

          {/* Resolved */}
          <Line
            type="monotone"
            dataKey="resolved"
            stroke="#22c55e"
            strokeWidth={3}
            name="Resolved"
          />

          {/* In Progress */}
          <Line
            type="monotone"
            dataKey="progress"
            stroke="#facc15"
            strokeWidth={3}
            name="In Progress"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StatsLineChart;