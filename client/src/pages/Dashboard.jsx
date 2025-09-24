import { useState,useContext, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import { UserContext } from "../context/UserContext";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Menu, X, Wallet, Users2Icon, Home as HomeIcon, LogOut, User, Bell } from "lucide-react";

export default function DashboardLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const sideMenuRef = useRef(null);
  const dropdownRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [showDebtDropdown, setShowDebtDropdown] = useState(false);
  const debtDropdownRef = useRef(null);
  const { user, setUser } = useContext(UserContext);
const socket = useSocket();

useEffect(() => {
  if (!socket) return;

  // Listen for user updates
  socket.on("userUpdated", (updatedUser) => {
    setUser(updatedUser); // updates user context
    localStorage.setItem("user", JSON.stringify(updatedUser));
  });

  return () => {
    socket.off("userUpdated");
  };
}, [socket, setUser]);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (isOpen && sideMenuRef.current && !sideMenuRef.current.contains(event.target)) {
      setIsOpen(false);
    }
    if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
    if (showDebtDropdown && debtDropdownRef.current && !debtDropdownRef.current.contains(event.target)) {
      setShowDebtDropdown(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [isOpen, isDropdownOpen, showDebtDropdown]);


  const [deletedNotifications, setDeletedNotifications] = useState(() => {
    const saved = localStorage.getItem("deletedNotifications");
    return saved ? JSON.parse(saved) : [];
  });

  

  const getNotificationId = (note) => {
    return note.replace(/\s+/g, "").toLowerCase(); // simple stable ID
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsDropdownOpen(false);
    setIsOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setIsOpen(false);
  const closeDropdown = () => setIsDropdownOpen(false);

  // Close side menu or dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && sideMenuRef.current && !sideMenuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isDropdownOpen]);

  // Fetch debts and filter deleted notifications
  const fetchDebts = async () => {
    if (!user?.email) return; 
    try {
      const res = await fetch(`${process.env.VITE_API_URL}/groups/user/${user.email}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const groups = await res.json();
      let debtNotes = [];

      for (const group of groups) {
        const resExpenses = await fetch(`${process.env.VITE_API_URL}/api/group-expenses/group/${group._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const { expenses } = await resExpenses.json();

        (expenses || []).forEach(exp => {
          if (exp.splitDetails) {
            Object.entries(exp.splitDetails).forEach(([member, amt]) => {
              if (member === user.email && exp.paidBy !== user.email) {
                debtNotes.push(`You owe ${exp.paidBy} ₹${amt} for "${exp.description}"`);
              } else if (exp.paidBy === user.email && member !== user.email) {
                debtNotes.push(`${member} owes you ₹${amt} for "${exp.description}"`);
              }
            });
          }
        });
      }

      // Filter out deleted notifications
      const filteredNotifications = [...new Set(debtNotes)].filter(
        note => !deletedNotifications.includes(getNotificationId(note))
      );
      setNotifications(filteredNotifications);
    } catch (err) {
      console.error(err);
    }
  };

  // Run fetchDebts on mount and whenever deletedNotifications change
  useEffect(() => {
    if (!user?.email) return; 
    fetchDebts();
   
  }, [user?.email, deletedNotifications]);

  return (
    <>
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-200 fixed top-0 left-0 z-30">
        <div className="w-full flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded-md  text-black hover:bg-gray-100  transition"
              onClick={() => setIsOpen(true)}
            >
              <Menu size={24} />
            </button>
            <span className="text-2xl font-medium text-gray-900">SplitMate</span>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Navigation buttons */}
            <button
              onClick={() => navigate("/dashboard/home")}
              className="flex items-center gap-1 p-1 rounded-lg bg-white text-black hover:bg-gray-100 hover:text-black transition"
            >
              <HomeIcon size={20} />
              <span className="text-sm font-medium">Home</span>
            </button>

            <button
              onClick={() => navigate("/dashboard/groups")}
              className="flex items-center gap-1 p-1 rounded-lg bg-white text-black hover:bg-gray-100 hover:text-black transition"
            >
              <Users2Icon size={20} />
              <span className="text-sm font-medium">Groups</span>
            </button>

            <button
              onClick={() => navigate("/dashboard/expenses")}
              className="flex items-center gap-1 p-1  rounded-lg bg-white text-black hover:bg-gray-100 hover:text-black transition"
            >
              <Wallet size={20} />
              <span className="text-sm font-medium">Personal Tracker</span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowDebtDropdown(!showDebtDropdown)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition"
              >
                <Bell size={20} className="text-gray-700" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </button>

              {showDebtDropdown && (
                <div ref={debtDropdownRef} className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="flex justify-between items-center px-2 py-1 border-b border-gray-200">
                    <h4 className="text-sm font-semibold">Notifications</h4>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => setNotifications([])}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-gray-500 p-2">No notifications yet.</p>
                    ) : (
                      notifications.map((note, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-xs text-gray-700 p-2 border-b border-gray-100"
                        >
                          <span>{note}</span>
                          <button
                            onClick={() => {
                              setNotifications(prev => {
                                const noteToDelete = prev[idx];
                                const updated = prev.filter((_, i) => i !== idx);

                                const newDeleted = [...deletedNotifications, getNotificationId(noteToDelete)];
                                setDeletedNotifications(newDeleted);
                                localStorage.setItem("deletedNotifications", JSON.stringify(newDeleted));

                                return updated;
                              });
                            }}
                            className="text-red-500 hover:text-red-700 text-[10px] ml-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="relative" ref={dropdownRef}>
              <img
                src={user?.avatar || "https://i.pravatar.cc/150"}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover cursor-pointer border"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              />
              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-gray-50 rounded-md border shadow-md p-1 z-50">
                  <button
                    className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm w-full hover:bg-gray-200"
                    onClick={() => {
                      navigate("/dashboard/profile");
                      setIsDropdownOpen(false);
                    }}
                  >
                    <User size={16} /> Profile
                  </button>
                  <div className="h-px bg-border my-1"></div>
                  <button
                    className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm w-full text-destructive hover:bg-gray-200"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Side Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            ref={sideMenuRef}
            className="bg-gray-700 relative w-64 h-full text-white shadow-lg transform transition-transform duration-300 ease-in-out"
          >
            <div className="p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Dashboard</h2>
              <button onClick={closeMenu} className="hover:bg-gray-600 rounded">
                <X size={24} />
              </button>
            </div>

            <nav className="mt-6 space-y-4 px-4">
              <div className="hover:bg-gray-600 p-1 rounded">
                <Link to="home" onClick={closeMenu} className="block">Home</Link>
              </div>
              <div className="hover:bg-gray-600 p-1 rounded">
                <Link to="profile" onClick={closeMenu} className="block">Profile</Link>
              </div>
              <div className="hover:bg-gray-600 p-1 rounded">
                <Link to="expenses" onClick={closeMenu} className="block">Expenses</Link>
              </div>
              <div className="hover:bg-gray-600 p-1 rounded">
                <Link to="groups" onClick={closeMenu} className="block">Groups</Link>
              </div>
              <div className="hover:bg-gray-600 p-1 rounded">
                <button onClick={handleLogout} className="block text-left w-full">Logout</button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-1 mt-20">
        <Outlet />
      </div>
    </>
  );
}
