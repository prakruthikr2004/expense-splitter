import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function GroupExpensePage() {
  const { id: groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});
  const [form, setForm] = useState({
    description: "",
    amount: "",
    splitType: "equal",
    splitDetails: {}
  });

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroupAndExpenses = async () => {
      try {
        const resGroup = await fetch(`http://localhost:5000/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` }
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

        const resExpenses = await fetch(
          `http://localhost:5000/api/group-expenses/group/${groupId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await resExpenses.json();
        setExpenses(data.expenses || []);
        setBalances(data.balances || {});
      } catch (err) {
        console.error(err);
      }
    };

    fetchGroupAndExpenses();
  }, [groupId, token, user.email, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSplitChange = (member, value) => {
    setForm((prev) => ({
      ...prev,
      splitDetails: { ...prev.splitDetails, [member]: Number(value) }
    }));
  };

  const handleAddExpense = async () => {
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        paidBy: user.email,
        splitDetails: { ...form.splitDetails, [user.email]: form.splitDetails[user.email] || 0 }
      };

      const res = await fetch(
        `http://localhost:5000/api/group-expenses/group/${groupId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();
      if (res.ok) {
        setExpenses([...expenses, data.expense]);
        setBalances(data.balances);
        setForm({ description: "", amount: "", splitType: "equal", splitDetails: {} });
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
        const res = await fetch(
          `http://localhost:5000/api/group-expenses/${expenseId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();

        if (res.ok) {
          setExpenses(expenses.filter((e) => e._id !== expenseId));
          setBalances(data.balances);
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

  const yourBalance = Object.values(balances).reduce((sum, amt) => sum + amt, 0);

  if (!group) return <div className="text-center mt-10">Loading...</div>;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
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

      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate(-1)} className="p-2 rounded-md hover:bg-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
            </button>
            <div>
              <h1 className="text-2xl font-medium text-gray-900">{group.name}</h1>
              <p className="text-sm text-gray-500">{group.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="transition-transform transform hover:scale-105 hover:shadow-lg bg-white flex flex-col gap-4 rounded-xl border p-6 text-center">
  <div className="flex items-center justify-center text-center w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-3">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="w-6 h-6 justify-center text-gray-500"
    >
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="25"
        fontWeight="bold"
        fill="currentColor"
      >
        ₹
      </text>
    </svg>
  </div>
  <p className="text-2xl font-medium">₹{totalExpenses.toFixed(2)}</p>
  <p className="text-sm text-gray-600 font-medium">Total Expenses</p>
</div>





          <div className="transition-transform transform hover:scale-105 hover:shadow-lg bg-white flex flex-col gap-4 rounded-xl border p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></svg>
            </div>
            <p className="text-2xl font-medium">{group.members.length}</p>
            <p className="text-sm text-gray-600 font-medium">Members</p>
          </div>

          <div className="transition-transform transform hover:scale-105 hover:shadow-lg bg-white flex flex-col gap-4 rounded-xl border p-6 text-center">
            <div className={`flex items-center justify-center w-12 h-12  rounded-lg mx-auto mb-3 ${yourBalance >= 0 ? "bg-green-100" : "bg-red-100"}`} >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${yourBalance >= 0 ? " text-green-600" : "text-red-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 17h6v-6"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m22 17-8.5-8.5-5 5L2 7"/></svg>
            </div>
            
<p className={`text-2xl font-medium ${yourBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
  ₹{yourBalance.toFixed(2)}
</p>

            <p className="text-sm font-medium text-gray-600">Your Balance</p>
          </div>
        </div>

        {/* Add Expense Form */}
        <div className="bg-gray-100  shadow-md rounded p-6 space-y-4">
          <h3 className="text-lg font-bold">Add Expense</h3>
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full border hover:border-gray-500 px-3 py-2 rounded"
          />
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Amount"
            className="w-full border hover:border-gray-500 px-3 py-2 rounded"
          />
          <select
            name="splitType"
            value={form.splitType}
            onChange={handleChange}
            className="w-full border  hover:border-gray-500 px-3 py-2 rounded"
          >
            <option value="equal">Equal</option>
            <option value="percentage">Percentage</option>
          </select>

          {form.splitType === "percentage" &&
  group.members.map((m) => (
    <div key={m} className="flex items-center space-x-2 w-full">
      <label className="w-full">{m}</label>
      <div className="flex items-center ml-auto space-x-1">
        <input
          type="number"
          value={form.splitDetails[m] || 0}
          onChange={(e) => handleSplitChange(m, e.target.value)}
          className="border px-2  hover:border-gray-500 py-1 rounded w-20 text-right"
        />
        <span>%</span>
      </div>
    </div>
))}


          <button
            onClick={handleAddExpense}
            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Add Expense
          </button>
        </div>

        {/* Balances */}
        <div className="bg-gray-100 shadow-md rounded p-6 space-y-4">
          <h3 className="text-lg font-bold">Balance Details</h3>
          {Object.entries(balances)
            .filter(([other, amt]) => other !== user.email && amt !== 0)
            .map(([other, amt]) => (
              <div key={other} className="flex transition-transform transform hover:scale-105 hover:shadow-lg justify-between p-3 bg-gray-50 rounded border">
                <span className="font-medium">{other}</span>
                <span className={amt > 0 ? "text-green-600" : "text-red-600"}>
                  ₹{Math.abs(amt).toFixed(2)} {amt > 0 ? "owes you" : "you owe"}
                </span>
              </div>
            ))}
        </div>

        {/* Recent Expenses */}
        <div className="bg-gray-100 shadow-md rounded p-6 space-y-4">
          <h3 className="text-lg font-medium">Recent Expenses</h3>
          {expenses.map((exp) => (
            <div key={exp._id} className="flex bg-white transition-transform transform hover:scale-105 hover:shadow-lg justify-between p-3 border rounded">
              <div>
                <p className="font-medium">{exp.description}</p>
                <p className="text-sm text-gray-500">Paid by {exp.paidBy}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">₹{exp.amount.toFixed(2)}</p>
                {exp.paidBy === user.email && (
                  <button
                    onClick={() => handleDeleteExpense(exp._id)}
                    className="text-red-500 text-sm hover:text-red-900"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
