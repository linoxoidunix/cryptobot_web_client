import React, { createContext, useContext, useState } from "react";
import {
  Tabs,
  Tab,
  Button,
  Box,
} from "@mui/material";
import { ThemeContext } from "./ThemeContext";
import subscriptionService from "./subscriptionService";
import OrderBook from "./OrderBook.js";
import Wallet from "./Wallet";
import Pnl from "./Pnl";

const SubscriptionContext = createContext();

export const useSubscription = () => useContext(SubscriptionContext);

const App = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [tabValue, setTabValue] = useState(0);
 
  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <SubscriptionContext.Provider value={subscriptionService}>
      <Box
        sx={{
          backgroundColor: (theme) => theme.palette.background.primary,
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
              {/* Все компоненты монтируются сразу, но скрыты с помощью display: none */}
              <Box
          sx={{
            display: tabValue === 0 ? "block" : "none", // Для активной вкладки показываем компонент
            height: "100vh",  // Пример высоты для вкладки
            // position: "absolute", // Скрытые вкладки не влияют на layout
          }}
        >
          <OrderBook />
        </Box>

        <Box
          sx={{
            display: tabValue === 1 ? "block" : "none",
            height: "100vh",  // Пример высоты для вкладки

            // position: "absolute",
          }}
        >
          <Pnl />
        </Box>


        
        
        <Box
          sx={{
            display: tabValue === 2 ? "block" : "none",
            height: "100vh",  // Пример высоты для вкладки

            // position: "absolute",
          }}
        >
          <Wallet />
        </Box>

        <Box
          sx={{
            display: tabValue === 3 ? "block" : "none",
            position: "absolute",
            height: "100vh",  // Пример высоты для вкладки

          }}
        >
          <h2>Dashboard Content</h2>
        </Box>

        <Box
          sx={{
            display: tabValue === 4 ? "block" : "none",
            position: "absolute",
            height: "100vh",  // Пример высоты для вкладки

          }}
        >
          <h2>Settings</h2>
        </Box>
        </Box>
    </SubscriptionContext.Provider>
  );
};

export default App;
