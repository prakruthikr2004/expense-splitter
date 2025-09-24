import { useEffect } from "react";
import { useNavigate , useParams } from "react-router-dom";
import axios from "axios";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function verify() {
      try {
        await axios.get(`${import.meta.env.VITE_API_URL}/auth/verify/${token}`);
        alert("Email verified successfully! You can now log in.");
        navigate("/login");
      } catch (err) {
        alert("Verification failed: " + (err.response?.data?.message || err.message));
      }
    }
    verify();
  }, [token]);

  return <div>Verifying your email...</div>;
}
