import { useNavigate } from "react-router-dom";

function IssueCard({ issue }) {

  const navigate = useNavigate();

  const getStatusColor = (status) => {

    if (status === "pending") {
      return "bg-red-500";
    }

    if (status === "in_progress") {
      return "bg-lime-500";
    }

    if (status === "resolved") {
      return "bg-green-500";
    }

    return "bg-gray-400";

  };

  return (

    <div
      onClick={() => navigate(`/issue/${issue.id}`)}
      className="group bg-white/75 backdrop-blur-lg border border-emerald-200 p-6 rounded-[32px] shadow-md hover:shadow-xl hover:shadow-emerald-200/40 cursor-pointer transition-all duration-300 hover:-translate-y-1"
    >

      {/* TOP TAGS */}
      <div className="flex flex-wrap gap-3 mb-5">

        <span className="bg-emerald-100 text-emerald-700 text-sm px-4 py-1.5 rounded-full font-semibold border border-emerald-200">
          {issue.category}
        </span>

        <span
          className={`text-white text-sm px-4 py-1.5 rounded-full font-semibold ${getStatusColor(issue.status)}`}
        >
          {issue.status}
        </span>

      </div>

      {/* TITLE */}
      <h3 className="text-3xl font-extrabold text-emerald-600 mb-4 group-hover:text-emerald-700 transition">
        {issue.title}
      </h3>

      {/* DESCRIPTION */}
      <p className="text-slate-500 text-lg leading-relaxed mb-6">
        {issue.description}
      </p>

      {/* LOCATION + TIME */}
      <div className="text-slate-500 text-base mb-4 flex items-center gap-2">
        📍 {issue.location} • {issue.time}
      </div>

      {/* DEPARTMENT */}
      <div className="text-emerald-600 text-xl font-bold">
        {issue.department}
      </div>

    </div>

  );
}

export default IssueCard;