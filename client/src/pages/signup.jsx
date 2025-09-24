import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$.!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleSignup = async (e) => {
  e.preventDefault();

  if (!strongPasswordRegex.test(password)) {
    console.log("Frontend rejected password:", password);
  toast.error("Password must be strong...");
    return;
  }
  

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      // ✅ Show message from backend
      toast.success(data.message || "Verification email sent. Please check your inbox.");

      // ⏳ Wait 2 seconds, then redirect to login
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } else {
      toast.error(data.message || "Signup failed ❌");
    }
  } catch (err) {
    toast.error("Something went wrong!");
    console.error(err);
  }
};


  return (
    <div className="min-h-screen flex">
      {/* Toast Notifications */}
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

      {/* Left Side */}
      <div className="hidden lg:flex lg:w-3/5 xl:w-2/5 bg-black p-4 text-white">
        <div className="flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Hero Text */}
          <div className="space-y-8">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
              SplitMate <br />
              <span className="text-gray-300">Start splitting smarter today</span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed">
              Join thousands of users who trust SplitMate to manage their shared
              expenses. It only takes a minute to get started.
            </p>

            {/* Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-6">
              {/* Secure */}
              <Feature
                title="Secure & Private"
                desc="Your data is encrypted and never shared."
                icon={
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                }
              />

              {/* Fast */}
              <Feature
                title="Lightning Fast"
                desc="Split bills in seconds, not minutes."
                icon={
                  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
                }
              />

              {/* Relationship Friendly */}
              <Feature
                title="Relationship Friendly"
                desc="Keep money matters transparent."
                icon={
                  <path d="M12 21C12 21 5 14.686 5 9.5a7 7 0 0 1 14 0c0 5.186-7 11.5-7 11.5z" />
                }
              />

              {/* Always Free */}
              <Feature
                title="Always Free"
                desc="Core features are free forever."
                icon={
                  <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm1 15h-2v-2h2Zm0-4h-2V7h2Z" />
                }
              />
            </div>
          </div>

          
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="lg:w-2/5 flex items-center justify-center p-10 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">
              Create your account
            </h2>
            <p className="text-gray-500">
              Join SplitMate and start managing expenses effortlessly
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-4">
              {/* Name */}
              <InputField
                id="name"
                label="Full Name"
                type="text"
                value={name}
                setValue={setName}
                placeholder="John Doe"
              />

              {/* Email */}
              <InputField
                id="email"
                label="Email Address"
                type="email"
                value={email}
                setValue={setEmail}
                placeholder="you@example.com"
              />

              {/* Password */}
              <InputField
                id="password"
                label="Password"
                type="password"
                value={password}
                setValue={setPassword}
                placeholder="Create a strong password"
              />
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-black text-white rounded-md font-medium shadow-md hover:bg-gray-900 transition"
            >
              Create Account
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


          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="underline hover:text-black"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

/* Reusable Feature Component */
function Feature({ title, desc, icon }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {icon}
        </svg>
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-gray-400">{desc}</p>
      </div>
    </div>
  );
}

/* Reusable Input Component */
function InputField({ id, label, type, value, setValue, placeholder }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        required
        className="mt-1 block w-full rounded-md border px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:ring-2 focus:ring-gray-400"
      />
    </div>
  );
}
