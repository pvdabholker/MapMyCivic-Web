import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#10b981", "#f59e0b", "#2563eb"];

export default function IssuePieChart({ data }) {
  // ✅ Prevent crash if data is undefined
  const safeData = {
    resolved: data?.resolved || 0,
    pending: data?.pending || 0,
    progress: data?.progress || 0,
  };

  const total =
    safeData.resolved + safeData.pending + safeData.progress;

  const pieData = [
    {
      name: `Resolved (${safeData.resolved})`,
      value: safeData.resolved,
    },
    {
      name: `Pending (${safeData.pending})`,
      value: safeData.pending,
    },
    {
      name: `In Progress (${safeData.progress})`,
      value: safeData.progress,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md w-full">
      {/* Title */}
      <h2 className="font-semibold mb-2 text-blue-700 text-lg">
        🥧 Issue Distribution
      </h2>

      {/* Total Count */}
      <p className="text-sm text-gray-500 mb-4">
        Total Issues:{" "}
        <span className="font-semibold text-gray-800">
          {total}
        </span>
      </p>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            outerRadius={100}
            innerRadius={50} // ✅ donut style (better UI)
            paddingAngle={3}
            label={({ percent }) =>
              percent > 0
                ? `${(percent * 100).toFixed(0)}%`
                : ""
            }
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          {/* Tooltip */}
          <Tooltip
            formatter={(value, name) => [`${value} issues`, name]}
          />

          {/* Legend */}
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}