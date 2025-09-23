import { createContext, useContext, useState, useEffect } from "react";

// Create context
const ThemeContext = createContext();

// Provider component
export const ThemeProvider = ({ children }) => {
  // Define your theme object (customize as you want)
  const [theme, setTheme] = useState({
    primary: "#000000", // main color (black)
    secondary: "#ffffff", // secondary (white)
    accent: "#f59e0b", // orange/yellow accent
    background: "#f3f4f6", // grayish background
    text: "#111827", // default text color
    buttonBg: "#000000", 
    buttonText: "#ffffff"
  });

  // Optional: save theme in localStorage to persist across reloads
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setTheme(JSON.parse(savedTheme));
  }, []);

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", JSON.stringify(newTheme));
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => useContext(ThemeContext);
