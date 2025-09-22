import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { UserContext } from "./UserContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const userContext = useContext(UserContext) || {};
  const { user, setUser } = userContext;
  const token = localStorage.getItem("token");
  const [socket, setSocket] = useState(null);

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (!token) return;

    // ✅ Only create socket once (if it doesn’t exist yet)
    if (socket) return;

    const s = io("https://expense-splitter-nsts.onrender.com", { auth: { token } });
    setSocket(s);

    s.on("connect", () => console.log("✅ Socket connected:", s.id));

    if (setUser) {
      s.on("userUpdated", (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        console.log("User updated via socket:", updatedUser);
      });
    }

    s.on("deleteUser", (deletedUserId) => {
      const currentUser =
        userRef.current || JSON.parse(localStorage.getItem("user"));
      if (currentUser?._id === deletedUserId) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/signup";
      }
    });

    return () => {
      s.disconnect();
      console.log("❌ Socket disconnected");
    };
    // ✅ Dependency only on token (not setUser)
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
