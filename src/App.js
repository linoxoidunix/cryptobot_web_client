import React, { useContext, useState } from "react";
import {
  Tabs,
  Tab,
  Button,
  Box,
} from "@mui/material";
import { ThemeContext } from "./ThemeContext";
import OrderBook from "./OrderBook.js";
import Wallet from "./Wallet";
import Pnl from "./Pnl";

const App = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [tabValue, setTabValue] = useState(0);
 
  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box
      sx={{
        backgroundColor: (theme) => theme.palette.background.primary,
        minHeight: "100vh",
        padding: 2,
      }}
    >
      {/* Переключение темы */}
      <Button
        variant="contained"
        onClick={toggleTheme}
        style={{ marginBottom: "20px" }}
      >
        {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      </Button>

      {/* Вкладки */}
      <Tabs value={tabValue} onChange={handleChangeTab} centered>
        <Tab label="OrderBook" />
        <Tab label="PnL" />
        <Tab label="Wallet" />
        <Tab label="Dashboard" />
        <Tab label="Settings" />
      </Tabs>

      {/* Содержимое вкладок */}
      {tabValue === 0 && <OrderBook />}
      {tabValue === 1 && <Pnl />}
      {tabValue === 2 && <Wallet />}
      {tabValue === 3 && <h2>Dashboard Content</h2>}
      {tabValue === 4 && <h2>Settings</h2>}
    </Box>
  );
};

export default App;
