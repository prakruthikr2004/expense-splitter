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
      const res = await fetch("http://localhost:5000/auth/login", {
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

      <div className="flex flex-col md:flex-row justify-center items-center min-h-screen gap-6  bg-gray-100 ">
        {/* Left Side (Logo + Text) */}
        <div className="hidden lg:flex lg:w-2/3 xl:w-3/5 bg-black  text-white p-12 xl:p-16 overflow-y-auto">
          <div className="flex flex-col justify-between">
            <div>
              <div className="mb-16">
                <h1 className="text-4xl xl:text-5xl font-medium leading-tight mb-6">
                  SplitMate<br />
                  <span className="text-white/80">
                    split expenses, not friendships!
                  </span>
                </h1>
                <p className="text-lg text-white/70 leading-relaxed">
                  The simple way to track shared expenses and settle up with friends. Keep your relationships drama-free with transparent money management.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-6 mb-0 mt-0 py-0">
                {/* Feature 1 */}
                <div className="flex items-start space-x-3 ">
                  <div className="mt-1 p-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-8 justify-center w-8"
                      aria-hidden="true"
                    >
                      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
                      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                      <path d="M12 17.5v-11" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Track Every Expense</h3>
                    <p className="text-sm text-white/70">Never lose track of shared costs again</p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start space-x-3">
                  <div className="mt-1 p-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-8 justify-center w-8"
                      aria-hidden="true"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <path d="M16 3.128a4 4 0 0 1 0 7.744" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Split with Friends</h3>
                    <p className="text-sm text-white/70">Easily divide bills among group members</p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-start space-x-3  rounded  ">
                  <div className="mt-1 p-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-8 justify-center w-8"
                      aria-hidden="true"
                    >
                      <path d="M16 7h6v6" />
                      <path d="m22 7-8.5 8.5-5-5L2 17" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Smart Analytics</h3>
                    <p className="text-sm text-white/70">Understand your spending patterns</p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="flex items-start space-x-3 rounded  ">
                  <div className="mt-1 p-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-8 justify-center w-8"
                      aria-hidden="true"
                    >
                      <path d="M21.801 10A10 10 0 1 1 17 3.335" />
                      <path d="m9 11 3 3L22 4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Settle Instantly</h3>
                    <p className="text-sm text-white/70">Quick and easy money settlements</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        
        {/* Right Side (Login Card) */}
<div className="md:w-1/3 mr-6  max-w  bg-white p-6 rounded-lg shadow-lg border border-gray-200 flex-shrink-0">
  
  {/* Welcome Text */}
  <div className="mb-6 text-center">
    <h3 className="text-2xl font-bold text-gray-800">Welcome back</h3>
    <p className="text-gray-600 mt-1">Login to your account to continue</p>
  </div>

  {/* Login Form */}
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
    onClick={() => (window.location.href = "http://localhost:5000/auth/google")}
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
</div>

      </div>
    </>
  );
}
