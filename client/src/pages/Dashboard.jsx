import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Bell, Wallet, Plus, User2Icon, Users2Icon } from "lucide-react";

export default function DashboardLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    setIsOpen(false);
  };

  const closeMenu = () => setIsOpen(false);
  const showHeader = location.pathname === "/dashboard/home";

  return (
    <>
      {/* Header only on Home */}
      {showHeader && (
        <header className="w-full bg-white border-b border-gray-200 fixed top-0 left-0 z-30">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            {/* Left: Hamburger + Brand */}
            <div className="flex items-center gap-3">
              <button
                className="p-2 rounded-md bg-black text-white hover:bg-gray-200 hover:text-gray-800 transition"
                onClick={() => setIsOpen(true)}
              >
                <Menu size={24} />
              </button>
              <span className="text-2xl font-medium text-gray-900">SplitMate</span>
            </div>

            {/* Right: Icons with labels */}
            <div className="flex items-center gap-4">
              
              {/* Groups */}
              <button
                onClick={() => navigate("/dashboard/groups")}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-black text-gray-200 hover:bg-gray-100 hover:text-black transition"
              >
                <Users2Icon size={20} className="" />
                <span className=" text-sm font-medium">Groups</span>
              </button>
              {/* Personal Tracker */}
              <button
                onClick={() => navigate("/dashboard/expenses")}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-black text-gray-200 hover:bg-gray-100 hover:text-black transition"
              >
                <Wallet size={20} className="" />
                <span className=" text-sm font-medium">Personal Tracker</span>
              </button>

              {/* Add Expense */}
              <button
                onClick={() => navigate("/dashboard/expenses?tab=add")}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-black text-gray-200 hover:bg-gray-100 hover:text-black transition"
              >
                <Plus size={20} />
                <span className="text-sm font-medium">Add Expense</span>
              </button>

              {/* Profile */}
              <img
                src={user?.avatar || "https://i.pravatar.cc/150"}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover cursor-pointer"
                onClick={() => navigate("/dashboard/profile")}
              />
            </div>
          </div>
        </header>
      )}

      {/* Side Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black bg-opacity-40"
            onClick={closeMenu}
          ></div>

          <div className="bg-gradient-to-b from-black to-gray-500 relative w-64 h-full text-white shadow-lg transform transition-transform duration-300 ease-in-out">
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
      <div className={`flex-1 p-6 ${showHeader ? "mt-20" : ""}`}>
        <Outlet />
      </div>
    </>
  );
}
