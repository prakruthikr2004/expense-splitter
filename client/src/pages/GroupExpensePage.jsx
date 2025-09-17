import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
export default function GroupExpensePage() {
  const { id: groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});
  const [settlements, setSettlements] = useState([]);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    splitType: "equal",
    splitDetails: {},
  });
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("balances");
  const [statsView, setStatsView] = useState("cards"); // "cards" or "chart"


  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  


  // Fetch group, expenses, balances, and settlements
  const fetchGroupData = async () => {
    try {
      const resGroup = await fetch(`http://localhost:5000/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resGroup.status === 403) {
        toast.error("You are not a member of this group");
        navigate("/");
        return;
      }

      const groupData = await resGroup.json();
      if (!groupData.members.includes(user.email)) {
        toast.error("You are not a member of this group");
        navigate("/");
        return;
      }
      setGroup(groupData);

      const resData = await fetch(
        `http://localhost:5000/api/group-expenses/group/${groupId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await resData.json();
      if (resData.ok) {
        setExpenses(data.expenses || []);
        setBalances(data.balances || {});
        setSettlements(data.settlements || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [groupId, token, user.email, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSplitChange = (member, value) => {
    setForm((prev) => ({
      ...prev,
      splitDetails: { ...prev.splitDetails, [member]: Number(value) },
    }));
  };

  const handleAddExpense = async () => {
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        paidBy: user.email,
        splitDetails: { ...form.splitDetails, [user.email]: form.splitDetails[user.email] || 0 },
      };

      const res = await fetch(
        `http://localhost:5000/api/group-expenses/group/${groupId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (res.ok) {
        fetchGroupData(); // Refresh everything
        setForm({ description: "", amount: "", splitType: "equal", splitDetails: {} });
        setShowForm(false);
        toast.success("Expense added successfully ✅");
      } else {
        toast.error(data.message || "Error adding expense ❌");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong ❌");
    }
  };

  const handleDeleteExpense = (expenseId) => {
    confirmDeleteToast(async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/group-expenses/${expenseId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          fetchGroupData(); // Refresh everything
          toast.success("Expense deleted successfully ✅");
        } else {
          toast.error(data.message || "Error deleting expense ❌");
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong ❌");
      }
    });
  };

  const confirmDeleteToast = (onConfirm) => {
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-2">
          <p>Are you sure you want to delete this expense?</p>
          <div className="flex gap-2">
            <button
              onClick={() => { onConfirm(); closeToast(); }}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Yes
            </button>
            <button onClick={closeToast} className="bg-gray-300 px-3 py-1 rounded">
              No
            </button>
          </div>
        </div>
      ),
      { autoClose: false }
    );
  };

  const handleSettle = async (otherUser, amt) => {
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-2">
          <p>Settle ₹{Math.abs(amt).toFixed(2)} with {otherUser}?</p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={async () => {
                closeToast();
                try {
                  const res = await fetch(
                    `http://localhost:5000/api/group-expenses/group/${groupId}/settle`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ withUser: otherUser }),
                    }
                  );
                  const data = await res.json();
                  if (res.ok) {
                    fetchGroupData(); // Refresh everything
                    toast.success(`Settled ₹${amt.toFixed(2)} with ${otherUser} ✅`);
                  } else {
                    toast.error(data.message || "Error settling ❌");
                  }
                } catch (err) {
                  console.error(err);
                  toast.error("Something went wrong ❌");
                }
              }}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-500"
            >
              Yes
            </button>
            <button onClick={closeToast} className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400">
              No
            </button>
          </div>
        </div>
      ),
      { autoClose: false, closeOnClick: false }
    );
  };

  const yourBalance = Object.values(balances).reduce((sum, amt) => sum + amt, 0);
  if (!group) return <div className="text-center mt-10">Loading...</div>;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
        toastClassName={() => "bg-gray-900 text-white border p-4 border-gray-700 rounded-lg shadow-lg"}
        bodyClassName={() => "text-sm text-gray-200"}
        progressClassName="bg-gray-400"
      />

      <div className="w-full px-4 py-4 flex flex-col md:flex-row gap-6">
        
        {/* Left Column */}

        <div className="md:w-1/3 space-y-5">
          <h1 className="text-xl md:text-xl font-bold text-gray-900">{group.name}</h1>
          <div className="flex justify-end gap-2 mb-2">
  <button
    onClick={() => setStatsView("cards")}
    className={`px-3 py-1 text-xs rounded-lg border ${statsView === "cards" ? "bg-black text-white" : "bg-white text-gray-600"}`}
  >
    Cards
  </button>
  <button
    onClick={() => setStatsView("chart")}
    className={`px-3 py-1 text-xs rounded-lg border ${statsView === "chart" ? "bg-black text-white" : "bg-white text-gray-600"}`}
  >
    Chart
  </button>
</div>
{statsView === "cards" ? (
  <div className="space-y-4">
    <div className="bg-white flex flex-col gap-2 rounded-xl border p-4 text-center hover:shadow-lg transform transition hover:scale-105">
            <p className="text-xl font-medium">₹{totalExpenses.toFixed(2)}</p>
            <p className="text-m text-gray-600 font-medium">Total Expenses</p>
          </div>
          <div className="bg-white flex flex-col gap-2 rounded-xl border p-4 text-center hover:shadow-lg transform transition hover:scale-105">
            <p className="text-xl font-medium">{group.members.length}</p>
            <p className="text-m text-gray-600 font-medium">Members</p>
          </div>
          <div className={`${yourBalance >= 0 ? "bg-green-50" : "bg-red-50"} flex flex-col gap-2 rounded-xl border p-4 text-center hover:shadow-lg transform transition hover:scale-105`}>
            <p className={`text-xl font-medium ${yourBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
              ₹{yourBalance.toFixed(2)}
            </p>
            <p className="text-m font-medium text-gray-600">Your Balance</p>
          </div>
  </div>
) : (
  <div className="bg-white rounded-xl border p-4 shadow-sm">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={[
            { name: "Total Expenses", value: totalExpenses, color: "#dc2626" },
            { name: "Your Balance", value: yourBalance, color: yourBalance >= 0 ? "#16a34a" : "#dc2626" },
          ]}
          margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
        >
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(val) =>
              typeof val === "number"
                ? val.toLocaleString("en-IN", { style: "currency", currency: "INR" })
                : val
            }
          />
          
          <Bar dataKey="value">
            <Cell fill="#dc2626" />
            <Cell fill={yourBalance >= 0 ? "#16a34a" : "#dc2626"} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
)}


          
        </div>

        {/* Right Column */}
        <div className="md:w-2/3 space-y-6">
          {/* Add Expense Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowForm(true)}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              + Add Expense
            </button>
          </div>

          {/* Add Expense Modal */}
          {showForm && (
            <div className="absolute top-12 left-0 w-full h-full flex justify-center items-start z-30 pointer-events-none">
              <div className="bg-black bg-opacity-30 absolute inset-0 pointer-events-auto"></div>
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mt-20 relative z-50 pointer-events-auto">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-900"
                  onClick={() => setShowForm(false)}
                >
                  ✕
                </button>
                <h3 className="text-lg font-bold mb-4">Add Expense</h3>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Description"
                  className="w-full border hover:border-gray-500 px-3 py-2 rounded mb-2"
                />
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="Amount"
                  className="w-full border hover:border-gray-500 px-3 py-2 rounded mb-2"
                />
                <select
                  name="splitType"
                  value={form.splitType}
                  onChange={handleChange}
                  className="w-full border hover:border-gray-500 px-3 py-2 rounded mb-2"
                >
                  <option value="equal">Equal</option>
                  <option value="percentage">Percentage</option>
                </select>

                {form.splitType === "percentage" &&
                  group.members.map((m) => (
                    <div key={m} className="flex items-center space-x-2 w-full mb-2">
                      <label className="w-full">{m}</label>
                      <div className="flex items-center ml-auto space-x-1">
                        <input
                          type="number"
                          value={form.splitDetails[m] || 0}
                          onChange={(e) => handleSplitChange(m, e.target.value)}
                          className="border px-2 hover:border-gray-500 py-1 rounded w-20 text-right"
                        />
                        <span>%</span>
                      </div>
                    </div>
                  ))}

                <button
                  onClick={handleAddExpense}
                  className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 w-full"
                >
                  Add Expense
                </button>
              </div>
            </div>
          )}

          {/* Toggle Bar */}
          <div className="bg-gray-100 rounded-xl p-1 flex w-full mb-2">
            {["balances", "expenses", "settlements"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-xl transition ${
                  activeTab === tab ? "bg-black text-white" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          {activeTab === "balances" && (
            <div className="bg-white border border-gray-200 shadow-md rounded-xl p-4">
              <h3 className="text-lg font-bold mb-3">Balance Details</h3>
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {Object.entries(balances)
                  .filter(([other, amt]) => other !== user.email && amt !== 0)
                  .map(([other, amt]) => (
                    <div
                      key={other}
                      className={`flex items-center justify-between p-3 rounded-lg transition hover:shadow-md ${
                        amt > 0 ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                          {other[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{other}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`font-semibold text-sm ${amt > 0 ? "text-green-600" : "text-red-600"}`}>
                          ₹{Math.abs(amt).toFixed(2)} {amt > 0 ? "owes you" : "you owe"}
                        </div>
                        {amt > 0 && (
                          <button
                            onClick={() => handleSettle(other, amt)}
                            className="bg-gray-800 text-white px-2 py-1 rounded text-xs hover:bg-gray-700"
                          >
                            Settle
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                {Object.entries(balances).filter(([other, amt]) => other !== user.email && amt !== 0).length === 0 && (
                  <p className="text-gray-400 text-center text-sm">No balances to display</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "expenses" && (
            <div className="bg-white border border-gray-200 shadow-md rounded-xl p-4">
              <h3 className="text-lg font-bold mb-3">Recent Expenses</h3>
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {expenses.length === 0 && <p className="text-gray-400 text-center text-sm">No expenses yet</p>}
                {expenses.map((exp) => (
                  <div
                    key={exp._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-md transition"
                  >
                    <div className="flex flex-col">
                      <p className="font-medium text-gray-800 text-sm">{exp.description}</p>
                      <p className="text-xs text-gray-500">Paid by {exp.paidBy}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="font-semibold text-gray-800 text-sm">₹{exp.amount.toFixed(2)}</p>
                      {exp.paidBy === user.email && (
                        <button
                          onClick={() => handleDeleteExpense(exp._id)}
                          className="text-red-500 text-xs hover:text-red-700 mt-1"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "settlements" && (
            <div className="bg-white border border-gray-200 shadow-md rounded-xl p-4">
              <h3 className="text-lg font-bold mb-3">Settlements</h3>
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {settlements.length === 0 ? (
                  <p className="text-gray-400 text-center text-sm">No settlements yet</p>
                ) : (
                  settlements.map((s) => (
                    <div
                      key={s._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-md transition"
                    >
                      <div className="flex flex-col">
                        <p className="text-sm text-gray-700">
                          {s.payer} paid ₹{s.amount.toFixed(2)} to {s.payee}
                        </p>
                        <p className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
