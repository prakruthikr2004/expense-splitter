import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";


export default function GroupDetail() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/groups/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setGroup(data);
        }
      } catch (err) {
        console.error("Error fetching group:", err);
      }
    };
    fetchGroup();
  }, [id]);

  if (!group) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">{group.name}</h2>
      <p className="mb-4">
        Members:{" "}
        {group.members && group.members.length > 0
          ? group.members.map((m) => m.email).join(", ")
          : "No members"}
      </p>
      {/* Later: list expenses + balances */}
    </div>
  );
}
