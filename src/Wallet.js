import React, { useState, useEffect } from "react";
import { Box, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useSubscription } from "./App";

const Pnl = () => {
  const loadSavedPNLData = () => {
    const savedPNLData = sessionStorage.getItem("pnlData");
    return savedPNLData ? JSON.parse(savedPNLData) : [];
  };

  const [pnlData, setPnlData] = useState(loadSavedPNLData());
  const [height, setHeight] = useState(window.innerHeight - 100); // Начальная высота
  const theme = useTheme();
  const subscriptionService = useSubscription();

  const columns = [
    { field: "exchange", headerName: "Exchange", width: 150 },
    { field: "pair", headerName: "Trading Pair", width: 150 },
    { field: "realized", headerName: "Realized", width: 150 },
    { field: "unrealized", headerName: "Unrealized", width: 150 },
    { field: "lastUpdate", headerName: "Timestamp", width: 180 },
  ];

  // Обновляем высоту при изменении размеров окна
  useEffect(() => {
    const handleResize = () => setHeight(window.innerHeight - 100);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // WebSocket data simulation
  useEffect(() => {
    console.log("Subscription service in pnl change:", subscriptionService);
    const handleUpdate = (data) => {
      console.log("Received data:", data);
      const { exchange, trading_pair, realized, unrealized } = data || {};
      const currentTime = new Date().toLocaleString();
      if (exchange && trading_pair && realized && unrealized) {
        setPnlData((prev) => {
          const existingIndex = prev.findIndex(
            (order) => order.exchange === exchange && order.pair === trading_pair
          );
          if (existingIndex !== -1) {
            return prev.map((order, index) =>
              index === existingIndex
                ? {
                    ...order,
                    realized: realized,
                    unrealized: unrealized,
                    lastUpdate: currentTime,
                  }
                : order
            );
          }
          return [
            ...prev,
            {
              id: `${exchange}-${trading_pair}`,
              exchange,
              pair: trading_pair,
              realized: realized,
              unrealized: unrealized,
              lastUpdate: currentTime,
            },
          ];
        });
      }
    };

    console.log("Subscribing to orderbook...");
    subscriptionService.subscribe("pnl", handleUpdate);

    return () => subscriptionService.unsubscribe("pnl", handleUpdate);
  }, [subscriptionService]);

  // Clear all data in DataGrid
  const handleClearData = () => {
    setPnlData([]);
    sessionStorage.removeItem("pnlData");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: theme.palette.background.primary,
        color: theme.palette.text.primary,
      }}
    >
      {/* Верхняя строка с кнопками */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "left",
          padding: 2,
        }}
      >
        {/* Button to open filter settings */}
        <Button variant="outlined">Open Filter Settings</Button>

        {/* Button to clear data */}
        <Button
          variant="outlined"
          onClick={handleClearData}
          sx={{ marginLeft: 2 }}
        >
          Clear Data
        </Button>
      </Box>

      {/* DataGrid с динамической высотой */}
      <Box sx={{ flexGrow: 1, height: height, width: "100%" }}>
        <DataGrid
          rows={pnlData || []}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          checkboxSelection
          disableSelectionOnClick
        />
      </Box>
    </Box>
  );
};

export default Pnl;
