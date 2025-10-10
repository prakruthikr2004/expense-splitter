import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Login successful 🎉");
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Login failed ❌");
      }
    } catch (err) {
      toast.error("Something went wrong!");
      console.error(err);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">

        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-2/3 xl:w-3/5 bg-black text-white p-12 xl:p-16 flex-col justify-center overflow-y-auto max-h-screen">
          <div className="flex flex-col justify-center h-full">
            {/* Logo & Intro */}
            <div className="mb-12">
              <h1 className="text-4xl xl:text-5xl font-medium leading-tight mb-4">
                SplitMate<br />
                <span className="text-white/80">split expenses, not friendships!</span>
              </h1>
              <p className="text-lg text-white/70 leading-relaxed">
                Track shared expenses and settle up with friends. Keep your relationships drama-free with transparent money management.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              {/* Feature 1 */}
              <Feature
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                    <path d="M12 17.5v-11" />
                  </svg>
                }
                title="Track Every Expense"
                description="Never lose track of shared costs again"
              />

              {/* Feature 2 */}
              <Feature
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <path d="M16 3.128a4 4 0 0 1 0 7.744" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                }
                title="Split with Friends"
                description="Easily divide bills among group members"
              />

              {/* Feature 3 */}
              <Feature
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                    <path d="M16 7h6v6" />
                    <path d="m22 7-8.5 8.5-5-5L2 17" />
                  </svg>
                }
                title="Smart Analytics"
                description="Understand your spending patterns"
              />

              {/* Feature 4 */}
              <Feature
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                    <path d="M21.801 10A10 10 0 1 1 17 3.335" />
                    <path d="m9 11 3 3L22 4" />
                  </svg>
                }
                title="Settle Instantly"
                description="Quick and easy money settlements"
              />
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex justify-center items-center p-4">
          <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            {/* Login Form */}
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              handleLogin={handleLogin}
              navigate={navigate}
            />
          </div>
        </div>
      </div>
    </>
  );
}

// Feature Component
const Feature = ({ icon, title, description }) => (
  <div className="flex items-start">
    <div className="mt-1 p-1 mr-3">{icon}</div>
    <div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-white/70">{description}</p>
    </div>
  </div>
);

// Login Form Component
const LoginForm = ({ email, setEmail, password, setPassword, handleLogin, navigate }) => (
  <>
    <div className="mb-6 text-center">
      <h3 className="text-2xl font-bold text-gray-800">Welcome back</h3>
      <p className="text-gray-600 mt-1">Login to your account to continue</p>
    </div>

    <form onSubmit={handleLogin} className="flex flex-col gap-4">
      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full h-12 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full h-12 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
      />
      <button
        type="submit"
        className="w-full h-12 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition"
      >
        Log In
      </button>
    </form>

    <div className="text-center mt-4">
      <button
        onClick={() => (window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`)}
        className="w-full h-12 border border-gray-300 rounded-md flex items-center justify-center gap-2 hover:bg-gray-100 transition"
      >
        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-5 h-5" />
        Continue with Google
      </button>
    </div>

    <div className="text-center my-4">
      <button
        onClick={() => navigate("/signup")}
        className="text-black text-sm font-medium hover:underline"
      >
        Create New Account
      </button>
    </div>

    <hr className="my-4 border-gray-300" />

    <div className="text-center">
      <button
        onClick={() => navigate("/")}
        className="text-gray-600 text-sm hover:underline"
      >
        Back to Home
      </button>
    </div>
  </>
);
