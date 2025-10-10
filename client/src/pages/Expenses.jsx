import { useContext, useState, useEffect } from "react";
import { ExpensesContext } from "../context/ExpensesContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { useSocket } from "../context/SocketContext";
import { v4 as uuidv4 } from "uuid";

import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  FileText,
  Plus,
  Minus,
  Tag,
  Calendar,
  Trash2,
} from "lucide-react";

export default function Expenses() {
  const { expenses, setExpenses, addExpense, deleteExpense } = useContext(ExpensesContext);

  const [type, setType] = useState("Expense");
  const [statsView, setStatsView] = useState("cards");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [activeTab, setActiveTab] = useState("history");

  const socket = useSocket();

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    const userId = localStorage.getItem("userId");
    if (userId) socket.emit("joinRoom", userId);

    const handleExpenseAdded = (expense) => {
      setExpenses((prev) => {
        if (prev.some((e) => e._id === expense._id)) return prev;
        return [expense, ...prev];
      });
    };

    const handleExpenseDeleted = ({ id }) => {
      setExpenses((prev) => prev.filter((e) => e._id !== id));
    };

    socket.on("expenseAdded", handleExpenseAdded);
    socket.on("expenseDeleted", handleExpenseDeleted);

    return () => {
      socket.off("expenseAdded", handleExpenseAdded);
      socket.off("expenseDeleted", handleExpenseDeleted);
    };
  }, [socket, setExpenses]);

  // Add expense
  const handleAdd = (e) => {
    e.preventDefault();
    if (!amount || !category || !date) return;

    const tempExpense = {
      _id: uuidv4(),
      type,
      amount: Number(amount),
      category,
      note,
      date,
    };

    // Optimistic UI update
    setExpenses((prev) => [tempExpense, ...prev]);
    setActiveTab("history"); // switch to history immediately

    addExpense({
      type,
      amount: Number(amount),
      category,
      note,
      date,
    })
      .then((savedExpense) => {
        setExpenses((prev) =>
          prev.map((e) => (e._id === tempExpense._id ? savedExpense : e))
        );
      })
      .catch(() => {
        setExpenses((prev) => prev.filter((e) => e._id !== tempExpense._id));
      });

    setAmount("");
    setCategory("");
    setNote("");
    setDate("");
  };

  // Delete expense
  const handleDelete = (id) => {
    // Optimistic UI delete
    setExpenses((prev) => prev.filter((e) => e._id !== id));

    deleteExpense(id).catch(() => {
      alert("Failed to delete transaction. Please try again.");
    });
  };

  const totalIncome = expenses.filter((e) => e.type === "Income").reduce((acc, e) => acc + e.amount, 0);
  const totalExpenses = expenses.filter((e) => e.type === "Expense").reduce((acc, e) => acc + e.amount, 0);
  const balance = totalIncome - totalExpenses;

  const formatRupee = (value) =>
    value.toLocaleString("en-IN", { style: "currency", currency: "INR" });

  const chartData = [
    { name: "Income", value: totalIncome || 0.01, fill: "green" },
    { name: "Expenses", value: totalExpenses || 0.01, fill: "red" },
    { name: "Net Balance", value: balance || 0.01, fill: balance >= 0 ? "#16a34a" : "#dc2626" },
  ];

  return (
    <div className="w-full h-screen px-4 lg:px-6 py-2 grid grid-cols-1 lg:grid-cols-3 gap-3 overflow-hidden">
      {/* Stats */}
      <div className="lg:col-span-1 flex flex-col h-full">
        <h3 className="text-2xl font-semibold mb-1">Personal Tracker</h3>
        <p className="text-gray-400 mb-2">Track your expenses and income</p>

        <div className="flex justify-end gap-2 mb-2">
          <button onClick={() => setStatsView("cards")} className={`px-3 py-1 text-xs font-semibold rounded-lg border ${statsView === "cards" ? "bg-black text-white" : "bg-white text-gray-600"}`}>Cards</button>
          <button onClick={() => setStatsView("chart")} className={`px-3 py-1 text-xs font-semibold rounded-lg border ${statsView === "chart" ? "bg-black text-white" : "bg-white text-gray-600"}`}>Chart</button>
        </div>

        {statsView === "cards" ? (
          <div className="flex flex-col gap-3 pb-6">
            {[{ label: "Total Income", value: totalIncome, icon: <TrendingUp className="w-6 h-6 text-green-600" />, color: "text-green-600", isMoney: true },
              { label: "Total Expenses", value: totalExpenses, icon: <TrendingDown className="w-6 h-6 text-red-600" />, color: "text-red-600", isMoney: true },
              { label: "Net Balance", value: balance, icon: <PiggyBank className="w-6 h-6 text-gray-500" />, color: balance >= 0 ? "text-green-600" : "text-red-600", isMoney: true },
              { label: "Transactions", value: expenses.length, icon: <FileText className="w-6 h-6 text-gray-500" />, color: "text-gray-800", isMoney: false }].map((card, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center justify-between hover:shadow-md transition">
                <div>
                  <p className="text-xs text-gray-500">{card.label}</p>
                  <p className={`text-lg font-semibold ${card.color}`}>{card.isMoney ? formatRupee(card.value) : card.value}</p>
                </div>
                {card.icon}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl border p-5 shadow-sm pb-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip formatter={(val) => formatRupee(val)} />
                <Legend verticalAlign="bottom" align="center" payload={chartData.map((item) => ({ value: item.name, color: item.fill, type: "square" }))} />
                <Bar dataKey="value">{chartData.map((entry, index) => (<Cell key={index} fill={entry.fill} />))}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Add / History */}
      <div className="lg:col-span-2 flex flex-col h-full">
        <div className="bg-gray-100 rounded-xl p-1 flex w-full mb-2">
          <button onClick={() => setActiveTab("add")} className={`flex-1 px-4 py-2 text-sm font-medium rounded-xl transition ${activeTab === "add" ? "bg-black text-white" : "text-gray-500 hover:text-gray-800"}`}>Add Transaction</button>
          <button onClick={() => setActiveTab("history")} className={`flex-1 px-4 py-2 text-sm font-medium rounded-xl transition ${activeTab === "history" ? "bg-black text-white" : "text-gray-500 hover:text-gray-800"}`}>Transaction History</button>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          {activeTab === "add" && (
            <div className="bg-gray-100 rounded-xl border shadow p-4 flex-shrink-0">
              <form onSubmit={handleAdd} className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setType("Expense")} className={`flex items-center justify-center gap-2 h-8 px-3 py-1 rounded-md text-sm font-medium transition ${type === "Expense" ? "bg-black text-white hover:bg-gray-700" : "border bg-gray-50 text-gray-700 hover:bg-gray-100"}`}><Minus className="w-4 h-4" /> Expense</button>
                  <button type="button" onClick={() => setType("Income")} className={`flex items-center justify-center gap-2 h-8 px-3 py-1 rounded-md text-sm font-medium transition ${type === "Income" ? "bg-black text-white hover:bg-gray-700" : "border bg-gray-50 text-gray-700 hover:bg-gray-100"}`}><Plus className="w-4 h-4" /> Income</button>
                </div>
                <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required className="w-full border rounded-md px-2 py-1.5" />
                <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full border rounded-md px-2 py-1.5" />
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full border rounded-md px-2 py-1.5" />
                <textarea placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} className="w-full border rounded-md px-2 py-1.5" />
                <button type="submit" className="w-full bg-black text-white px-3 py-2 rounded-md">Add {type}</button>
              </form>
            </div>
          )}

          {activeTab === "history" && (
            <div className="bg-white rounded-xl border shadow p-4 flex-1 flex flex-col">
              <h4 className="text-base font-semibold mb-3">Recent Transactions</h4>
              <div className="flex-1 overflow-y-auto">
                {expenses.length === 0 ? <p className="text-gray-500 text-center text-sm">No transactions yet</p> :
                  expenses.map((e) => (
                    <div key={e._id} className="flex items-center justify-between p-3 mb-2 bg-gray-100 rounded-lg hover:shadow">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-white ${e.type === "Income" ? "bg-green-500" : "bg-red-500"}`}>{e.type === "Income" ? "+" : "-"}{formatRupee(e.amount)}</span>
                          <span className="text-sm">{e.note || "No note"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Tag className="w-3 h-3" /><span>{e.category}</span>
                          <Calendar className="w-3 h-3" /><span>{new Date(e.date).toISOString().split("T")[0]}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(e._id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
