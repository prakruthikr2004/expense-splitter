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
        // Save token & user in localStorage
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
    <ToastContainer
  position="top-right"
  autoClose={3000}
  theme="dark" // dark base
  toastClassName={() =>
    "bg-gray-900 text-white p-4 border border-gray-700 rounded-lg shadow-lg"
  }
  bodyClassName={() => "text-sm text-gray-200"}
  progressClassName="bg-gray-400"
/>

    <header class="relative container mx-auto px-4 py-6"><nav class="flex items-center justify-between">
      <div class="flex items-center gap-2 group">
        <div class="w-8 h-8 bg-black bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" color="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calculator w-4 h-4 text-primary-foreground" aria-hidden="true"><rect width="16" height="20" x="4" y="2" rx="2"></rect><line x1="8" x2="16" y1="6" y2="6"></line><line x1="16" x2="16" y1="14" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path><path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M12 18h.01"></path><path d="M8 18h.01"></path></svg></div><span class="text-xl font-semibold">SplitMate</span></div><div class="flex items-center gap-3">
          <button onClick={() => navigate("/")} data-slot="button" class=" hover:bg-gray-200 justify-center whitespace-nowrap rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg:not([class*='size-'])]:size-4 shrink-0 [&amp;_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 h-9 px-4 py-2 has-[&gt;svg]:px-3 flex items-center gap-2 hover:gap-3 transition-all"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left w-4 h-4" aria-hidden="true"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
          Back to Home</button>
          <button onClick={() => navigate("/signup")} data-slot="button" class="hover:bg-gray-700 bg-black text-white inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg:not([class*='size-'])]:size-4 shrink-0 [&amp;_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:text-accent-foreground dark:hover:bg-accent/50 h-9 px-4 py-2 has-[&gt;svg]:px-3 hover:bg-muted/50">
          Sign Up</button></div></nav></header>
          <div class="relative container mx-auto px-4 py-8 lg:py-16"><div class="max-w-lg mx-auto"><div class="text-center mb-8 space-y-4">
            <div class="bg-gray-100 inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full border"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-in w-4 h-4 text-muted-foreground" aria-hidden="true"><path d="m10 17 5-5-5-5"></path><path d="M15 12H3"></path><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path></svg><span class="text-sm text-muted-foreground">
              Welcome back to SplitMate</span></div>
              <h1 class="text-4xl font-bold bg-gradient-to-b from-black to-gray-400 bg-clip-text text-transparent">
                Welcome Back</h1>
                <p class="text-lg text-gray-500 text-muted-foreground">Log in to your account and continue splitting bills effortlessly</p></div>
                <div data-slot="card" class="bg-gradient-to-b from-black to-gray-500 text-white text-card-foreground flex flex-col gap-6 rounded-xl p-8 lg:p-10 shadow-2xl border-0 bg-card/50 backdrop-blur-sm">

              <form class="space-y-6" onSubmit={handleLogin}>
                <div class="space-y-3"><label data-slot="label" class="text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 flex items-center gap-2" for="email"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail w-4 h-4 text-muted-foreground" aria-hidden="true"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path><rect x="2" y="4" width="20" height="16" rx="2"></rect></svg>
              Email</label><div class="relative group">
                <input onChange={(e) => setEmail(e.target.value)} type="email" data-slot="input" class="text-black w-full px-4 py-2 border border-gray-300 rounded-md 
         hover:border-gray-400 hover:ring-1 hover:ring-gray-300 
         focus:border-gray-500 focus:ring-2 focus:ring-gray-400 
         outline-none transition file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex w-full min-w-0 rounded-md px-3 py-1 text-base outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-14 pl-4 pr-4 bg-input-background border-2 transition-all duration-200 hover:bg-input-background/80 border-transparent hover:border-border/50" 
                id="email" placeholder="Enter your email address" required value={email} /></div></div>
                <div class="space-y-3"><label data-slot="label" class="text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 flex items-center gap-2" for="password"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock w-4 h-4 text-muted-foreground" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      Password</label><div class="relative group">
                        <input
              type="password"
              className="text-black w-full px-4 py-2 border border-gray-300 rounded-md 
         hover:border-gray-400 hover:ring-1 hover:ring-gray-300 
         focus:border-gray-500 focus:ring-2 focus:ring-gray-400 
         outline-none transition file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex w-full min-w-0 rounded-md px-3 py-1 text-base outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-14 pl-4 pr-4 bg-input-background border-2 transition-all duration-200 hover:bg-input-background/80 border-transparent hover:border-border/50" 
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
                        
                         </div></div>
                         <button data-slot="button" class="w-full px-4 py-2 border border-gray-300 rounded-md 
         hover:border-gray-400 hover:ring-1 hover:ring-gray-300 
         focus:border-gray-500 focus:ring-2 focus:ring-gray-400 
         outline-none transition inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg:not([class*='size-'])]:size-4 shrink-0 [&amp;_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive text-primary-foreground hover:bg-primary/90 px-4 py-2 has-[&gt;svg]:px-3 w-full h-14 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]" type="submit"><div class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-in w-4 h-4" aria-hidden="true"><path d="m10 17 5-5-5-5"></path><path d="M15 12H3"></path><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path></svg>
                         Log In</div></button></form>
                         <div class="mt-0 text-center"><p class="text-sm text-muted-foreground">
                          Don't have an account? 
                          <button onClick={() => navigate("/signup")} data-slot="button" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg:not([class*='size-'])]:size-4 shrink-0 [&amp;_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive underline-offset-4 hover:underline has-[&gt;svg]:px-3 p-0 h-auto font-medium text-primary hover:text-primary/80 transition-colors">
                          Sign up here</button></p></div></div>
                          <div class="mt-6 flex items-center justify-center gap-8 text-xs text-muted-foreground"><div class="flex items-center gap-1"><div class="w-2 h-2 bg-green-500 rounded-full"></div><span>Secure Login</span></div><div class="flex items-center gap-1"><div class="w-2 h-2 bg-blue-500 rounded-full"></div><span>Privacy Protected</span></div><div class="flex items-center gap-1"><div class="w-2 h-2 bg-purple-500 rounded-full"></div><span>Always Free</span></div></div></div></div>



    
    </>
  );
}
