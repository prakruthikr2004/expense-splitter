import { useState,useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserContext } from "../context/UserContext"; // adjust path

import { LogOut, SquarePen, Check, X, Camera } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const { user, setUser } = useContext(UserContext);


  // Fetch user from backend
  const fetchUser = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(data);
      setNewName(data.name);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch user data");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Update name
const handleUpdate = async () => {
  if (!newName.trim()) {
    toast.error("Name cannot be empty!");
    return;
  }
  try {
    const res = await fetch("http://localhost:5000/users/update-name", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newName }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || "Failed to update name");
      return;
    }

    // Save the updated token and user
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(data.user));

    toast.success("Name updated successfully!");
    setIsEditing(false);
  } catch (err) {
    console.error("Frontend update error:", err);
    toast.error("Failed to update name");
  }
};



  const handleDeleteAccount = () => {
  toast.info(
    ({ closeToast }) => (
      <div className="flex flex-col gap-2">
        <span>Are you sure you want to delete your account? This cannot be undone.</span>
        <div className="flex gap-2 justify-end mt-2">
          <button
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 text-sm"
            onClick={closeToast}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-white text-sm"
            onClick={async () => {
              closeToast();
              try {
                const res = await fetch("http://localhost:5000/users/me", {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();

                if (!res.ok) {
                  toast.error(data.message || "Failed to delete account");
                  return;
                }

                localStorage.removeItem("token");
                localStorage.removeItem("user");
                toast.success(data.message || "Account deleted successfully!");
                setTimeout(() => navigate("/signup"), 1500);
              } catch (err) {
                console.error(err);
                toast.error("Failed to delete account");
              }
            }}
          >
            Delete
          </button>
        </div>
      </div>
    ),
    { autoClose: false } // Keep toast open until user clicks
  );
};


  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };



  if (!user) return <div>Loading...</div>;

const handleAvatarChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("avatar", file);

  try {
    const res = await fetch("http://localhost:5000/users/avatar", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`, // ✅ do NOT set Content-Type manually
      },
      body: formData,
    });

    const data = await res.json(); // this will work once backend returns proper JSON

    if (res.ok && data.success) {
      setUser((prev) => ({ ...prev, avatar: newAvatarUrl }));
      localStorage.setItem("user", JSON.stringify({ ...user, avatar: data.avatar }));
      toast.success("Avatar updated successfully!");

    } else {
      toast.error(data.message || "Failed to update avatar");
    }
  } catch (err) {
    console.error("Upload error:", err);
    toast.error("Failed to update avatar");
  }
};



  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <div className="w-full px-6 py-2 ">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            
            <h1 className="text-3xl font-medium text-foreground">Profile Settings</h1>
          </div>
          <p className="text-gray-600 text-muted-foreground">Manage your SplitMate account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card text-card-foreground flex flex-col gap-6 bg-gray-50 rounded-xl border">
              <div className="px-6 pt-6 pb-6 text-center space-y-4">
                <div className="relative inline-block">
  <img
    src={user.avatar || "https://i.pravatar.cc/150"}
    alt="Profile"
    className="w-24 h-24 rounded-full border mx-auto object-cover"
  />
  <button
    onClick={() => document.getElementById("avatarInput").click()}
    className="absolute -bottom-2 bg-gray-300 hover:bg-gray-200 -right-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 p-0"
  >
    <Camera size={16} />
  </button>
  <input
    type="file"
    id="avatarInput"
    className="hidden"
    accept="image/*"
    onChange={handleAvatarChange}
  />
</div>


                <h3 className="font-medium text-foreground">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <span className="inline-block px-3 py-1 text-xs font-semibold text-white rounded-full
             bg-gradient-to-r from-gray-800 via-gray-600 to-gray-900
             shadow-lg
             relative overflow-hidden">
  SplitMate Member

  
  <span className="absolute top-0 left-0 w-full h-1/2 bg-white opacity-20 rounded-full transform -skew-y-12"></span>
</span>

              </div>

              <div className="px-6 pb-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Member since</span>
                  <span className="text-sm text-foreground">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last active</span>
                  <span className="text-sm text-foreground">{new Date(user.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Info */}
            <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border">
              <div className="px-6 pt-6 bg-gray-50 pb-6 space-y-6">
                <div className="space-y-2 bg-gray-50">
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <div className="flex items-center justify-between p-3 bg-input-background rounded-lg border">
                    {isEditing ? (
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="border px-3 py-1 rounded-md w-full mr-3"
                      />
                    ) : (
                      <span className="text-foreground">{user.name}</span>
                    )}

                    {isEditing ? (
                      <div className="flex gap-2">
                        <button onClick={handleUpdate} className="p-2 bg-black text-white rounded-full hover:bg-gray-500">
                          <Check size={16} />
                        </button>
                        <button onClick={() => setIsEditing(false)} className="p-2 bg-white text-black rounded-full hover:bg-gray-500 hover:text-white">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 hover:bg-gray-200 rounded-full"
                      >
                        <SquarePen size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email Address</label>
                  <div className="p-3 bg-input-background rounded-lg border flex justify-between items-center">
                    <span className="text-foreground">{user.email}</span>
                    <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs text-foreground">Verified</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Contact support to change your email address</p>
                </div>
              </div>
            </div>

            {/* Logout */}
            {/* Logout + Help Section */}
<div>
  <div className="flex justify-end">
  <button
    onClick={handleLogout}
    className="gap-2 bg-red-600 text-white  rounded-md px-10 py-2 inline-flex items-center hover:bg-red-700"
  >
    <LogOut size={16} /> Log Out
  </button>
</div>


  <div className="px-6 pt-3 pb-6 text-center space-y-1">
    <p className="text-sm text-muted-foreground">Need help with your account?</p>
    <div className="flex justify-center gap-4">
      <button className="inline-flex items-center justify-center gap-2 text-xs text-primary underline hover:underline">
        Contact Support
      </button>
      <span className="text-muted-foreground text-xs">•</span>
      <button className="inline-flex items-center justify-center gap-2 text-xs text-primary underline hover:underline">
        Help Center
      </button>
      <span className="text-muted-foreground text-xs">•</span>
      <button className="inline-flex items-center justify-center gap-2 text-xs text-primary underline hover:underline">
        Report Issue
      </button>
      <span className="text-muted-foreground text-xs">•</span>
      <button onClick={handleDeleteAccount} className="inline-flex items-center justify-center gap-2 text-xs text-red-600 hover:text-red-900 text-primary underline hover:underline">
        Delete Account
      </button>
    </div>
  </div>
</div>

          </div>
        </div>
      </div>
    </>
  );
}
