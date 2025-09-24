import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token); // store JWT
      // optional: small delay for UX
      setTimeout(() => {
        navigate("/dashboard"); // redirect to dashboard
      }, 500);
    } else {
      navigate("/login"); // fallback if no token
    }
  }, [navigate]);

  return <div>Logging in...</div>;
}
