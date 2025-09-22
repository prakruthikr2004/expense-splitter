
import  { useContext, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import GroupForm from "../components/GroupForm";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, Users ,Trash2 } from "lucide-react";
import { UserContext } from "../context/UserContext";
import { useSocket, SocketProvider } from "../context/SocketContext";

export default function Groups() {
  const [groups, setGroups] = useState([]);
   
  const socket = useSocket();
  const [showForm, setShowForm] = useState(false);
  const token = localStorage.getItem("token");
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    // When a new group is created
    socket.on("groupCreated", (newGroup) => {
      setGroups((prev) => [...prev, newGroup]);
      toast.success(`New group created: ${newGroup.name}`);
    });

    // When a group is deleted
    socket.on("groupDeleted", (deletedGroupId) => {
      setGroups((prev) => prev.filter((g) => g._id !== deletedGroupId));
      toast.info("A group was deleted");
    });

    // Cleanup on unmount
    return () => {
      socket.off("groupCreated");
      socket.off("groupDeleted");
    };
  }, [socket]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/groups", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch groups");
      const data = await res.json();

      // fetch summaries
      const groupsWithSummary = await Promise.all(
        data.map(async (group) => {
          try {
            const summaryRes = await fetch(
              `http://localhost:5000/groups/${group._id}/summary`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!summaryRes.ok) throw new Error("Failed to fetch summary");
            const summary = await summaryRes.json();
            return { ...group, summary };
          } catch {
            return {
              ...group,
              summary: { totalSpent: 0, userShare: 0, netBalance: 0 },
            };
          }
        })
      );

      setGroups(groupsWithSummary);
    } catch (err) {
      toast.error("Error fetching groups: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleGroupCreated = (newGroup) => {
  setGroups((prev) => {
    // Prevent duplicates
    if (prev.find((g) => g._id === newGroup._id)) return prev;
    return [...prev, newGroup];
  });
  setShowForm(false);
  toast.success("Group created successfully!");
};

  const confirmGroupDeleteToast = (onConfirm) => {
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-2">
          <p>Are you sure you want to delete this group?</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onConfirm();
                closeToast();
              }}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Yes
            </button>
            <button
              onClick={closeToast}
              className="bg-gray-300 px-3 py-1 rounded"
            >
              No
            </button>
          </div>
        </div>
      ),
      { autoClose: false }
    );
  };

  const handleDeleteGroup = (groupId) => {
    confirmGroupDeleteToast(async () => {
      try {
        const res = await fetch(`http://localhost:5000/groups/${groupId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message);
        }

        setGroups((prev) => prev.filter((g) => g._id !== groupId));
        toast.success("Group deleted successfully ✅");
      } catch (err) {
        toast.error("Failed to delete group: " + err.message);
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
        toastClassName={() =>
          "bg-gray-900 text-white border p-4 border-gray-700 rounded-lg shadow-lg"
        }
        bodyClassName={() => "text-sm text-gray-200"}
        progressClassName="bg-gray-400"
      />

      {/* Page Header */}
      <div className="w-full px-4 lg:px-6 py-2 space-y-0 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Groups</h1>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-black text-white hover:bg-gray-700 transition"
        >
          <Plus className="h-4 w-4" /> Create group
        </button>
      </div>

      {/* Groups Grid */}
      <div className="w-full px-4 lg:px-6 py-2 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {loading ? (
            <p className="text-gray-600">Loading groups...</p>
          ) : groups.length > 0 ? (
            groups.map((group) => (
              <div
                key={group._id}
                onClick={() =>
                  navigate(`/dashboard/groups/${group._id}/expenses`)
                }
                className="bg-card bg-gradient-to-b from-gray-300 via-gray-200 to-gray-100 text-card-foreground flex flex-col gap-6 rounded-xl border cursor-pointer hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className="px-6 pt-6 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold">{group.name}</h4>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGroup(group._id);
                    }}
                    className="text-black hover:text-gray-600 transition"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                {/* Card Content */}
                <div className="px-6 pb-6">
                  {/* Members Avatars */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex -space-x-2">
                      {group.members?.slice(0, 4).map((member, i) => {
  // member could be { email, avatar } or just email string
  const email = member.email || member; // fallback if it's a string
  const avatar =
    member.avatar || // member's avatar from backend
    (email === user.email ? user.avatar : null) || // logged-in user's avatar
    `https://i.pravatar.cc/150?u=${email}`; // fallback

  return (
    <div key={i} className="relative group">
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-background">
        <img
          src={avatar}
          alt={email}
          className="w-8 h-8 rounded-full object-cover"
        />
      </span>

      {/* Tooltip on hover */}
      <div className="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block z-10 w-max bg-gray-900 text-white text-xs rounded-lg shadow-lg px-2 py-1">
        {email}
      </div>
    </div>
  );
})}



                      {group.members?.length > 4 && (
                        <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs text-muted-foreground">
                          +{group.members.length - 4}
                        </div>
                      )}
                    </div>
                    <div className="relative group inline-block">
                      <span className="inline-flex items-center bg-black text-white justify-center rounded-md border px-2 py-0.5 text-xs font-medium cursor-pointer">
                        {group.members?.length || 0} members
                      </span>

                      {/* Tooltip */}
                      <div className="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block z-10 w-max bg-gray-900 text-white text-xs rounded-lg shadow-lg p-2">
                        <ul className="space-y-1">
                          {group.members?.map((m, i) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border my-3"></div>

                  {/* Balances */}
                  {group.balances &&
                    Object.entries(group.balances).filter(
                      ([, amt]) => amt !== 0
                    ).length > 0 && (
                      <div className="bg-gray-50 p-2 rounded mb-2">
                        <h4 className="font-semibold text-sm mb-1">Balances:</h4>
                        <ul className="space-y-1 text-sm">
                          {Object.entries(group.balances)
                            .filter(([, amt]) => amt !== 0)
                            .map(([member, amt]) => (
                              <li key={member}>
                                <span
                                  className={
                                    amt > 0 ? "text-green-600" : "text-red-600"
                                  }
                                >
                                  {amt > 0
                                    ? `${member} owes you ₹${amt.toFixed(2)}`
                                    : `You owe ${member} ₹${Math.abs(
                                        amt
                                      ).toFixed(2)}`}
                                </span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                  {/* Placeholder stats */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Total spent</span>
                    <span className="font-medium">₹{group.summary?.totalSpent.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground font-medium">Your share</span>
                    <span className="font-medium">₹{group.summary?.userShare.toFixed(2) || "0.00"}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No groups yet.</p>
          )}
        </div>
      </div>

      {/* Group Creation Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 relative">
            {/* Close button */}
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-3 right-3 text-white hover:text-gray-400 transition text-xl font-bold"
            >
              &times;
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Create Group</h3>
            <GroupForm onGroupCreated={handleGroupCreated} />
          </div>
        </div>
      )}
    </div>
  );
}
