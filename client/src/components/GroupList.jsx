import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function GroupList({ refresh }) {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchGroups = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${process.env.VITE_API_URL}/groups`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setGroups(data);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, [refresh]); // refetch when a group is created

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">My Groups</h2>
      <ul className="space-y-2">
        {groups.map((g) => (
          <li
            key={g._id}
            className="p-2 border rounded bg-gray-100 shadow-sm hover:bg-gray-200 transition"
          >
            {/* 👇 Link to GroupExpenses page */}
            <Link to={`/groups/${g._id}/expenses`} className="block">
              <p className="font-semibold">{g.name}</p>
              <p className="text-sm text-gray-600">
                Members: {g.members.map((m) => m.email).join(", ")}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
