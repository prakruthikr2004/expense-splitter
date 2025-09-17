import { useContext, useEffect, useState } from "react";
import { ExpensesContext } from "../context/ExpensesContext";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";



export default function Home() {
  const { expenses } = useContext(ExpensesContext);
  const [groups, setGroups] = useState([]);
  const [balances, setBalances] = useState({});
  const token = localStorage.getItem("token");

const { user } = useContext(UserContext);

  const navigate = useNavigate();

  
  const fetchGroups = async () => {
    try {
      const res = await fetch("http://localhost:5000/groups", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch groups");

      const groupData = await res.json();
      setGroups(groupData);

      const balancesData = {};

      for (const group of groupData) {
        const resExp = await fetch(
          `http://localhost:5000/api/group-expenses/group/${group._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await resExp.json();
        console.log("Balances for group", group._id, data.balances);

        balancesData[group._id] = data.balances || {};
      }

      setBalances(balancesData);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching groups: " + err.message);
    }
  };
  
  const balance = expenses.reduce(
    (acc, exp) => (exp.type === "Income" ? acc + exp.amount : acc - exp.amount),
    0
  );

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="w-full px-6 mt-0 space-y-8">
      
      {/* Welcome Banner */}
      <div className=" hover:shadow-xl bg-gradient-to-b from-black to-gray-500 p-6 rounded-xl shadow text-center">
        <h2 className="text-3xl font-bold text-white">
          Welcome back, {user.name}!
        </h2>
        <p className="text-gray-200 mt-2">Here's your spending overview.</p>
      </div>

      

      {/* Expenses + Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Recent Expenses & Income */}
       <div className="flex flex-col rounded-xl border bg-white shadow overflow-hidden">
  {/* Header */}
  {/* Header */}
<div className="px-6 py-4 flex flex-row items-center justify-between border-b bg-white">
  <div className="flex items-center gap-4">
    <h4 className="text-lg font-medium">Your Recent Expenses & Income</h4>

    {/* Balance Badge */}
    <div
      className={`flex items-center gap-2 px-4 py-1.5 rounded-full shadow-md border text-sm font-semibold ${
        balance >= 0
          ? "bg-green-50 text-green-700 border-green-300"
          : "bg-red-50 text-red-700 border-red-300"
      }`}
    >
      <span>Balance:</span>
      <span className="text-base">{`₹${balance.toFixed(2)}`}</span>
    </div>
  </div>

  {/* View all button */}
  <button
    onClick={() => navigate("/dashboard/expenses")}
    className="text-sm text-gray-500 hover:text-black flex items-center gap-1"
  >
    View all
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  </button>
</div>


  {/* Content */}
  <div className="px-6 py-4 space-y-4">
    {expenses.length > 0 ? (
      expenses.slice(0, 5).map((exp) => (
        <div
          key={exp._id}
          className="flex items-center justify-between py-3 border-b last:border-b-0 hover:bg-gray-100 rounded-lg px-2 -mx-2 transition-colors"
        >
          {/* Left side */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="lucide lucide-receipt h-4 w-4 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                <path d="M12 17.5v-11" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-black">{exp.category}</p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>
                  {new Date(exp.date).toLocaleDateString("en-IN")}
                </span>
                <span>•</span>
                <span>{exp.type}</span>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="text-right">
            <p className="font-medium text-black">₹{exp.amount.toFixed(2)}</p>
            <p
              className={`text-sm ${
                exp.type === "Income" ? "text-green-600" : "text-red-600"
              }`}
            >
              {exp.type === "Income"
                ? "You get ₹" + exp.amount.toFixed(2)
                : "You spent ₹" + exp.amount.toFixed(2)}
            </p>
          </div>
        </div>
      ))
    ) : (
      <p className="text-gray-500 text-sm">No records found.</p>
    )}
  </div>
</div>


        {/* Groups */}
<div className="flex flex-col rounded-xl border bg-white shadow overflow-hidden">
  {/* Header */}
  <div className="px-6 py-4 flex flex-row items-center justify-between border-b bg-white">
    <h4 className="text-lg font-medium">Groups</h4>
    <div className="flex space-x-2">
      <button
        onClick={() => navigate("/dashboard/groups")}
        className="bg-black text-gray-50 text-sm border rounded-md px-3 py-1 flex items-center gap-1 hover:bg-gray-100 hover:text-black"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
        Create group
      </button>
    </div>
  </div>

  {/* Content */}
  <div className="px-6 py-4 space-y-4">
    {groups.length > 0 ? (
      groups.map((group) => {
        console.log("user.email:", user.email);
console.log("group balances keys:", Object.keys(balances[group._id] || {}));

        // Get current user's balance in this group
       const groupBalances = balances[group._id] || {};
const userBalance = Object.values(groupBalances).reduce((sum, amt) => sum + amt, 0);



        return (
          <div
            key={group._id}
            onClick={() => navigate(`/dashboard/groups/${group._id}/expenses`)}
            className="hover:bg-gray-100 flex items-center justify-between py-3 border-b border-border last:border-b-0 rounded-lg px-2 -mx-2 cursor-pointer transition-colors"
          >
            {/* Left: group name and members */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-muted rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="lucide lucide-users h-6 w-6 p-1 text-muted-foreground bg-gray-200 rounded-full"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <path d="M16 3.128a4 4 0 0 1 0 7.744" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-foreground">{group.name}</p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-muted-foreground">{group.members.length} members</p>
                  {/* avatars */}
                  <div className="flex -space-x-1">
                    {group.members?.slice(0, 3).map((member, i) => (
                      <div key={i} className="relative group">
                        <span className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-background">
                          <img
  src={
    member === user.email
      ? (user.avatar || `https://i.pravatar.cc/150?u=${member}`) // logged-in user’s avatar
      : `https://i.pravatar.cc/150?u=${member}` // other members' avatars
  }
  alt={member}
  className="w-5 h-5 rounded-full object-cover"
/>

                          
                        </span>
                        <div className="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block z-10 w-max bg-gray-900 text-white text-xs rounded-lg shadow-lg px-2 py-1">
                          {member}
                        </div>
                      </div>
                    ))}
                    {group.members.length > 3 && (
                      <span
                        title={group.members.slice(3).join(", ")}
                        className="h-5 w-5 rounded-full border-2 border-background bg-gray-300 text-gray-700 text-[10px] flex items-center justify-center"
                      >
                        +{group.members.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: user's balance */}
            <span
    className={`text-sm font-semibold ${
      userBalance > 0
        ? "text-green-600"
        : userBalance < 0
        ? "text-red-600"
        : "text-gray-500"
    }`}
  >
    ₹{userBalance.toFixed(2)}
  </span>
          </div>
        );
      })
    ) : (
      <p className="text-gray-500 text-sm">You are not part of any groups yet.</p>
    )}
  </div>
</div>


      <section className="text-center py-8 border-t border-border">
        <p className="text-gray-600 text-sm text-muted-foreground">
          You're all caught up! Add an expense or settle up with friends.
        </p>
      </section>
    </div>
     </div>
  );
  
}
