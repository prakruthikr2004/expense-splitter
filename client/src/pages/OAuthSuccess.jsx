import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token); // store JWT
      navigate("/dashboard");               // redirect to logged-in page
    } else {
      navigate("/login");                   // fallback if no token
    }
  }, []);

  return <div>Logging in...</div>;
}
