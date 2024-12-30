import React, { useState, useMemo } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Constants for theme values
const DARK_MODE_COLORS = {
  background: {
    primary: "#121212",
    secondary: "#333",
  },
  text: {
    primary: "#ffffff",
    secondary: "#bdbdbd",
  },
};

const LIGHT_MODE_COLORS = {
  background: {
    primary: "#ffffff",
    secondary: "#f0f0f0",
  },
  text: {
    primary: "#000000",
    secondary: "#6e6e6e",
  },
};

// Function to return theme overrides for MUI DataGrid
const getThemeOverrides = (isDarkMode) => ({
  MuiDataGrid: {
    styleOverrides: {
      root: {
        "& .MuiDataGrid-row:nth-of-type(even)": {
          backgroundColor: isDarkMode ? DARK_MODE_COLORS.background.secondary : LIGHT_MODE_COLORS.background.secondary,
        },
        "& .MuiDataGrid-row:nth-of-type(odd)": {
          backgroundColor: isDarkMode ? DARK_MODE_COLORS.background.primary : LIGHT_MODE_COLORS.background.primary,
        },
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: isDarkMode ? DARK_MODE_COLORS.background.primary : LIGHT_MODE_COLORS.background.primary,
          color: isDarkMode ? DARK_MODE_COLORS.text.primary : LIGHT_MODE_COLORS.text.primary,
          fontSize: "1.1rem",
        },
        "& .MuiDataGrid-cell": {
          fontSize: "0.9rem",
          padding: "2px",
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        marginBottom: 16, // 2 * 8px unit from Material UI's default spacing
        marginLeft: 16,   // 2 * 8px unit from Material UI's default spacing
        borderColor: isDarkMode ? DARK_MODE_COLORS.text.secondary : LIGHT_MODE_COLORS.text.secondary,
        color: isDarkMode ? DARK_MODE_COLORS.text.primary : LIGHT_MODE_COLORS.text.primary,
        '&:hover': {
          borderColor: isDarkMode ? DARK_MODE_COLORS.text.primary : LIGHT_MODE_COLORS.text.primary,
        },
        width: 'auto',  // Минимальная ширина для кнопки
        alignSelf: 'flex-start',  // Выравнивание кнопок по началу
      },
    },
  },
});

export const ThemeContext = React.createContext();

const ThemeContextProvider = React.memo(({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => setIsDarkMode((prevMode) => !prevMode);

  const theme = useMemo(() => {
    const colors = isDarkMode ? DARK_MODE_COLORS : LIGHT_MODE_COLORS;

    return createTheme({
      palette: {
        mode: isDarkMode ? "dark" : "light",
        background: colors.background,
        text: colors.text,
      },
      components: getThemeOverrides(isDarkMode),
    });
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
});

export default ThemeContextProvider;