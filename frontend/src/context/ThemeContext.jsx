/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useLocalStorage("tienda_theme_dark", false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", Boolean(dark));
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, setDark, toggleDark: () => setDark((d) => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return ctx;
};
