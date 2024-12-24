import React, { createContext, useState, useMemo } from "react";
import { createTheme, ThemeProvider } from "@mui/material";

export const ThemeContext = createContext();

const ThemeContextProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => setIsDarkMode((prevMode) => !prevMode);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? "dark" : "light",
          background: {
            primary: isDarkMode ? "#121212" : "#ffffff",
            secondary: isDarkMode ? "#333" : "#fff",
          },
          text: {
            primary: isDarkMode ? "#ffffff" : "#000000", // Белый текст для тёмной темы, чёрный для светлой
            secondary: isDarkMode ? "#bdbdbd" : "#4f4f4f", // Вторичный цвет текста
          },
        },
      }),
    [isDarkMode]
  );

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
