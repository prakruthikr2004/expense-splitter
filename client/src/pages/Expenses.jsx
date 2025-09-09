import { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ExpensesContext } from "../context/ExpensesContext";

import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  FileText,
  ArrowLeft,
  Plus,
  Minus,
  Tag,
  Calendar,
  Trash2,
  DollarSign,
} from "lucide-react";

export default function Expenses() {
  const { expenses, addExpense, deleteExpense } = useContext(ExpensesContext);

  const [type, setType] = useState("Expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [activeTab, setActiveTab] = useState("history");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "add") setActiveTab("add");
  }, [location.search]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!amount || !category || !date) return;

    addExpense({
      type,
      amount: Number(amount),
      category,
      note,
      date,
    });

    setAmount("");
    setCategory("");
    setNote("");
    setDate("");
    setActiveTab("history");
  };

  // Calculations
  const totalIncome = expenses
    .filter((e) => e.type === "Income")
    .reduce((acc, e) => acc + e.amount, 0);

  const totalExpenses = expenses
    .filter((e) => e.type === "Expense")
    .reduce((acc, e) => acc + e.amount, 0);

  const balance = totalIncome - totalExpenses;

  const formatRupee = (value) =>
    value.toLocaleString("en-IN", { style: "currency", currency: "INR" });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate("/dashboard/home")}
            className="size-9 rounded-md text-muted-foreground p-2 hover:text-foreground hover:bg-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-medium">Personal Tracker</h1>
        </div>
        <p className="text-gray-500">Track your personal income and expenses</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
  {[
    {
      label: "Total Income",
      value: totalIncome,
      icon: <TrendingUp className="w-8 h-8 text-green-600" />,
      color: "text-green-600",
      isMoney: true,
    },
    {
      label: "Total Expenses",
      value: totalExpenses,
      icon: <TrendingDown className="w-8 h-8 text-red-600" />,
      color: "text-red-600",
      isMoney: true,
    },
    {
      label: "Net Balance",
      value: balance,
      icon: <PiggyBank className="w-8 h-8 text-gray-500" />,
      color: balance >= 0 ? "text-green-600" : "text-red-600",
      isMoney: true,
    },
    {
      label: "Transactions",
      value: expenses.length,
      icon: <FileText className="w-8 h-8 text-gray-500" />,
      color: "text-gray-800",
      isMoney: false, // ✅ not money
    },
  ].map((card, idx) => (
    <div
      key={idx}
      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm flex items-center justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-gray-300"
    >
      <div>
        <p className="text-sm text-gray-500">{card.label}</p>
        <p className={`text-2xl font-medium ${card.color}`}>
          {card.isMoney ? formatRupee(card.value) : card.value}
        </p>
      </div>
      {card.icon}
    </div>
  ))}
</div>


      {/* Tabs */}
      <div className="flex flex-col gap-4">
        <div className="bg-gray-100 rounded-xl p-1 flex w-full max-w-md mx-auto">
          <button
            onClick={() => setActiveTab("add")}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-xl transition ${
              activeTab === "add"
                ? "bg-black shadow text-white"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Add Transaction
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-xl transition ${
              activeTab === "history"
                ? "bg-black shadow text-white"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Transaction History
          </button>
        </div>

        {/* Add Transaction Form */}
        {activeTab === "add" && (
          <div className="bg-gray-100 rounded-xl border shadow flex flex-col gap-6">
            <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 border-b pb-6">
              <h4 className="flex items-center gap-2 text-lg font-semibold">
                <DollarSign className="w-5 h-5" /> New Transaction
              </h4>
            </div>

            <div className="px-6 pb-6">
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType("Expense")}
                    className={`flex items-center justify-center gap-2 h-9 px-4 py-2 rounded-md text-sm font-medium transition ${
                      type === "Expense"
                        ? "bg-black text-white hover:bg-gray-700"
                        : "border bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Minus className="w-4 h-4" /> Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("Income")}
                    className={`flex items-center justify-center gap-2 h-9 px-4 py-2 rounded-md text-sm font-medium transition ${
                      type === "Income"
                        ? "bg-black text-white hover:bg-gray-700"
                        : "border bg-gray-50 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <Plus className="w-4 h-4" /> Income
                  </button>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label htmlFor="amount" className="text-sm font-medium">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      ₹
                    </span>
                    <input
                      id="amount"
                      type="number"
                      step="0.01"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 border rounded-md px-3 py-2 focus:border-black focus:ring-1 focus:ring-black transition"
                    />
                  </div>
                </div>

                {/* Note */}
                <div className="space-y-2">
                  <label htmlFor="note" className="text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    id="note"
                    rows="2"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="What was this for?"
                    className="w-full border rounded-md px-3 py-2 resize-none focus:border-black focus:ring-1 focus:ring-black transition"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Category
                  </label>
                  <input
                    id="category"
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Enter category (e.g., Food, Rent, Travel)"
                    className="w-full border rounded-md px-3 py-2 focus:border-black focus:ring-1 focus:ring-black transition"
                  />
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label htmlFor="date" className="text-sm font-medium">
                    Date
                  </label>
                  <input
                    id="date"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:border-black focus:ring-1 focus:ring-black transition"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-black text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Add {type}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Transaction History */}
        {activeTab === "history" && (
          <div className="bg-white  rounded-xl border shadow p-6 space-y-4">
            <h4 className="text-lg font-semibold mb-4">Recent Transactions</h4>
            {expenses.length === 0 && (
              <p className="text-gray-500 text-center">No transactions yet</p>
            )}
            {expenses.map((e) => (
              <div
                key={e._id}
                className="flex items-center justify-between p-4 transition-transform transform hover:scale-105 hover:shadow-lg  bg-gray-100 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-white ${
                        e.type === "Income" ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {e.type === "Income" ? (
                        <Plus className="w-3 h-3" />
                      ) : (
                        <Minus className="w-3 h-3" />
                      )}
                      {e.type.toLowerCase()}
                    </span>
                    <span
                      className={`text-lg font-medium ${
                        e.type === "Income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {e.type === "Income"
                        ? "+" + formatRupee(e.amount)
                        : "-" + formatRupee(e.amount)}
                    </span>
                  </div>
                  <p className="font-medium mb-1">{e.note || "No note"}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
  <Tag className="w-4 h-4" />
  <span>{e.category}</span>
  <span>•</span>
  <Calendar className="w-4 h-4" />
  <span>{new Date(e.date).toISOString().split("T")[0]}</span>
</div>

                </div>
                <button
                  onClick={() => deleteExpense(e._id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
