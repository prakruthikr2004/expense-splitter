import { useState } from "react";

export default function GroupForm({ onGroupCreated }) {
  const [name, setName] = useState("");
  const [members, setMembers] = useState([""]); // start with 1 input
  const token = localStorage.getItem("token");

  const handleMemberChange = (index, value) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const addMemberField = () => {
    setMembers([...members, ""]);
  };

  const removeMemberField = (index) => {
    if (members.length === 1) return; // keep at least one field
    const updated = members.filter((_, i) => i !== index);
    setMembers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://expense-splitter-nsts.onrender.com/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          members: members.filter((m) => m.trim() !== ""), // remove empty ones
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onGroupCreated(data);
        setName("");
        setMembers([""]); // reset
      } else {
        const err = await res.json();
        console.error("Error creating group:", err);
        alert(err.message || "Failed to create group");
      }
    } catch (err) {
      console.error("Request error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800">
      {/* Group Name */}
      <div>
        <label className="block text-sm font-medium text-gray-200">
          Group Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-gray-100 focus:outline-none"
          placeholder="e.g. Goa Trip"
        />
      </div>

      
      {/* Members */}
      <div>
        <label className="block text-sm font-medium text-gray-200">
          Members
        </label>
        {members.map((member, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="email"
              value={member}
              onChange={(e) => handleMemberChange(index, e.target.value)}
              required
              className="flex-1 px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-gray-100 focus:outline-none"
              placeholder="member@example.com"
            />
            {members.length > 1 && (
              <button
                type="button"
                onClick={() => removeMemberField(index)}
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addMemberField}
          className="mt-2 text-gray-300 hover:underline"
        >
          + Add another member
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-2 px-4 bg-black text-white rounded-lg shadow hover:bg-gray-500 transition"
      >
        Create Group
      </button>
    </form>
  );
}
