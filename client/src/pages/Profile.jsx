import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LogOut, SquarePen, Check, X } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user")) || {
    name: "Guest",
    email: "guest@example.com",
  };

  const [user, setUser] = useState(storedUser);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user.name);

  const handleUpdate = () => {
    if (!newName.trim()) {
      toast.error("Name cannot be empty!");
      return;
    }
    const updatedUser = { ...user, name: newName };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    toast.success("Name updated successfully!");
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
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

      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Back Button + Profile Title in one row (top-left) */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/dashboard/home")}
            className="hover:bg-gray-200 p-2 rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-gray-600 hover:scale-110 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-b from-gray-900 to-gray-600 rounded-xl border shadow p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <img
              src={
                user?.avatar && user.avatar.startsWith("http")
                  ? user.avatar
                  : "https://i.pravatar.cc/150"
              }
              alt="Profile"
              className="w-24 h-24 rounded-full border mb-3"
            />
            <h4 className="text-xl text-white font-semibold">{user.name}</h4>
            <p className="text-gray-400">{user.email}</p>
          </div>

          {/* Account Details */}
          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="text-sm font-medium flex text-gray-300 items-center gap-2">
                Full Name
              </label>
              <div className="flex items-center justify-between p-3 hover:bg-gray-300 bg-gray-100 rounded-md">
                {isEditing ? (
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="border px-3 py-1 rounded-md w-full mr-3"
                  />
                ) : (
                  <span>{user.name}</span>
                )}

                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdate}
                      className="p-2 bg-black text-white rounded-full hover:bg-gray-500"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="p-2 bg-white text-black rounded-full hover:bg-gray-500 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setNewName(user.name);
                      setIsEditing(true);
                    }}
                    className="p-2 hover:bg-gray-200 rounded-full"
                  >
                    <SquarePen size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Email (Not editable) */}
            <div>
              <label className="text-sm text-gray-300 font-medium">
                Email Address
              </label>
              <div className="p-3 bg-gray-100 rounded-md hover:bg-gray-300">
                {user.email}
              </div>
              <p className="text-xs text-gray-300 mt-3 flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Email cannot be changed. Contact support to update it.
              </p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-500"
          >
            <LogOut size={16} /> Logout
          </button>
          <p className="text-xs mt-2 justify-center text-center text-muted-foreground">
            Need help? Contact our support team
          </p>
        </div>
      </div>
    </>
  );
}
