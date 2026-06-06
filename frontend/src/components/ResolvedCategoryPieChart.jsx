import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

function ResolvedCategoryPieChart({ issues }) {

  // Step 1: Filter only resolved issues
  const resolvedIssues = issues.filter(
    (issue) => issue.status === "Resolved"
  );

  // Step 2: Count per category
  const categoryCount = {};

  resolvedIssues.forEach((issue) => {
    if (!categoryCount[issue.category]) {
      categoryCount[issue.category] = 0;
    }
    categoryCount[issue.category]++;
  });

  // Step 3: Convert to chart format
  const data = Object.keys(categoryCount).map((key) => ({
    name: key,
    value: categoryCount[key],
  }));

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#14B8A6"];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">
        Resolved Issues by Category
      </h2>

      <PieChart width={400} height={300}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>

        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}

export default ResolvedCategoryPieChart;