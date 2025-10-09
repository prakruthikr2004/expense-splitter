import { useContext, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ExpensesContext } from "../context/ExpensesContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { useSocket } from "../context/SocketContext";
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
  const location = useLocation();
  const initialized = useRef(false); // ✅ Prevent double effect execution

  /* -------------------- SOCKET LISTENERS -------------------- */
  useEffect(() => {
    if (!socket || initialized.current) return;
    initialized.current = true; // ✅ Only run once

    const handleExpenseAdded = (expense) => {
      setExpenses((prev) => {
        if (!expense?._id || prev.some((e) => e._id === expense._id)) return prev;
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

  /* -------------------- DEDUPLICATE EXPENSES -------------------- */
  useEffect(() => {
    setExpenses((prev) => {
      const seen = new Set();
      return prev.filter((e) => {
        if (!e._id || seen.has(e._id)) return false;
        seen.add(e._id);
        return true;
      });
    });
  }, []);

  /* -------------------- HANDLE URL PARAM -------------------- */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "add") setActiveTab("add");
  }, [location.search]);

  /* -------------------- ADD EXPENSE -------------------- */
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!amount || !category || !date) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticExpense = {
      _id: tempId,
      type,
      amount: Number(amount),
      category,
      note,
      date,
    };

    setExpenses((prev) => [optimisticExpense, ...prev]);

    try {
      const added = await addExpense({
        type,
        amount: Number(amount),
        category,
        note,
        date,
      });

      if (added && added._id) {
        setExpenses((prev) =>
          prev.map((e) => (e._id === tempId ? added : e))
        );
      }
    } catch (error) {
      console.error("❌ Error adding expense:", error);
      setExpenses((prev) => prev.filter((e) => e._id !== tempId));
    }

    setAmount("");
    setCategory("");
    setNote("");
    setDate("");
    setActiveTab("history");
  };

  /* -------------------- CALCULATIONS -------------------- */
  const totalIncome = expenses
    .filter((e) => e.type === "Income")
    .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

  const totalExpenses = expenses
    .filter((e) => e.type === "Expense")
    .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

  const balance = totalIncome - totalExpenses;

  const formatRupee = (value) =>
    value.toLocaleString("en-IN", { style: "currency", currency: "INR" });

  const chartData = [
    { name: "Income", value: totalIncome || 0.01, fill: "green" },
    { name: "Expenses", value: totalExpenses || 0.01, fill: "red" },
    {
      name: "Net Balance",
      value: balance || 0.01,
      fill: balance >= 0 ? "#16a34a" : "#dc2626",
    },
  ];

  /* -------------------- UI -------------------- */
  return (
    <div className="w-full h-screen px-4 lg:px-6 py-2 grid grid-cols-1 lg:grid-cols-3 gap-3 overflow-hidden">
      {/* LEFT: Stats */}
      <div className="lg:col-span-1 flex flex-col h-full">
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-semibold mb-1">Personal Tracker</h3>
            <p className="text-gray-400 mb-2">Track your expenses and income</p>

            {/* Toggle */}
            <div className="flex justify-end gap-2 mb-2">
              <button
                onClick={() => setStatsView("cards")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border ${
                  statsView === "cards"
                    ? "bg-black text-white"
                    : "bg-white text-gray-600"
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setStatsView("chart")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border ${
                  statsView === "chart"
                    ? "bg-black text-white"
                    : "bg-white text-gray-600"
                }`}
              >
                Chart
              </button>
            </div>

            {statsView === "cards" ? (
              <div className="flex flex-col gap-3 pb-6">
                {[ 
                  {
                    label: "Total Income",
                    value: totalIncome,
                    icon: <TrendingUp className="w-6 h-6 text-green-600" />,
                    color: "text-green-600",
                    isMoney: true,
                  },
                  {
                    label: "Total Expenses",
                    value: totalExpenses,
                    icon: <TrendingDown className="w-6 h-6 text-red-600" />,
                    color: "text-red-600",
                    isMoney: true,
                  },
                  {
                    label: "Net Balance",
                    value: balance,
                    icon: <PiggyBank className="w-6 h-6 text-gray-500" />,
                    color: balance >= 0 ? "text-green-600" : "text-red-600",
                    isMoney: true,
                  },
                  {
                    label: "Transactions",
                    value: expenses.length,
                    icon: <FileText className="w-6 h-6 text-gray-500" />,
                    color: "text-gray-800",
                    isMoney: false,
                  },
                ].map((card, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center justify-between hover:shadow-md transition"
                  >
                    <div>
                      <p className="text-xs text-gray-500">{card.label}</p>
                      <p className={`text-lg font-semibold ${card.color}`}>
                        {card.isMoney ? formatRupee(card.value) : card.value}
                      </p>
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
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      payload={chartData.map((item) => ({
                        value: item.name,
                        color: item.fill,
                        type: "square",
                      }))}
                    />
                    <Bar dataKey="value">
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Add / History */}
      <div className="lg:col-span-2 flex flex-col h-full">
        <div className="bg-gray-100 rounded-xl p-1 flex w-full mb-2">
          <button
            onClick={() => setActiveTab("add")}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-xl transition ${
              activeTab === "add"
                ? "bg-black text-white"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Add Transaction
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-xl transition ${
              activeTab === "history"
                ? "bg-black text-white"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Transaction History
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          {/* ADD FORM */}
          {activeTab === "add" && (
            <div className="bg-gray-100 rounded-xl border shadow p-4 flex-shrink-0">
              <form onSubmit={handleAdd} className="space-y-2">
                {/* Input fields remain same as before */}
                {/* ... */}
              </form>
            </div>
          )}

          {/* HISTORY */}
          {activeTab === "history" && (
            <div className="bg-white rounded-xl border shadow p-4 flex-1 flex flex-col">
              <h4 className="text-base font-semibold mb-3">
                Recent Transactions
              </h4>
              <div className="flex-1 overflow-y-auto">
                {expenses.length === 0 && (
                  <p className="text-gray-500 text-center text-sm">
                    No transactions yet
                  </p>
                )}
                {expenses.map((e) => (
                  <div
                    key={e._id}
                    className="flex items-center justify-between p-3 mb-2 bg-gray-100 rounded-lg hover:shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
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
                          className={`text-sm font-medium ${
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
                      <p className="text-sm mb-0.5">{e.note || "No note"}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Tag className="w-3 h-3" />
                        <span>{e.category}</span>
                        <span>•</span>
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(e.date).toISOString().split("T")[0]}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteExpense(e._id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
