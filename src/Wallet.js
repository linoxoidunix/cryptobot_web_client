import React, { useState, useEffect } from "react";
import { Box, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";

const Wallet = () => {
  const loadSavedWalletData = () => {
    const savedWalletData = sessionStorage.getItem("walletData");
    return savedWalletData ? JSON.parse(savedWalletData) : [];
  };

  const [wallets, setWallets] = useState(loadSavedWalletData());
  const theme = useTheme();

  const columns = [
    { field: "exchange", headerName: "Exchange", width: 150 },
    { field: "ticker", headerName: "Ticker", width: 150 },
    { field: "value", headerName: "Value", width: 200 },
    { field: "lastUpdate", headerName: "Last Update", width: 180 },
  ];

  // WebSocket data simulation
  useEffect(() => {
    console.log("Initializing SharedWorker for wallet data...");

    const worker = new SharedWorker("/sharedworker.js");

    worker.port.onmessage = (event) => {
      console.log("Received message from SharedWorker:", event.data);

      const data = event.data;
      const { exchange, ticker, value } = data || {};
      const currentTime = new Date().toLocaleString();

      if (exchange && ticker && value) {
        setWallets((prevWalletData) => {
          const existingIndex = prevWalletData.findIndex(
            (obj) => obj.exchange === exchange && obj.ticker === ticker
          );

          if (existingIndex !== -1) {
            const updatedWalletData = prevWalletData.map((obj, index) =>
              index === existingIndex
                ? {
                    ...obj,
                    value,
                    lastUpdate: currentTime,
                  }
                : obj
            );
            sessionStorage.setItem("walletData", JSON.stringify(updatedWalletData));
            return updatedWalletData;
          } else {
            const newWalletData = [
              ...prevWalletData,
              {
                id: Date.now(),
                exchange,
                ticker,
                value,
                lastUpdate: currentTime,
              },
            ];
            sessionStorage.setItem("walletData", JSON.stringify(newWalletData));
            return newWalletData;
          }
        });
      } else {
        console.warn("Invalid wallet data received:", data);
      }
    };

    worker.port.postMessage({ action: "subscribe", key: "wallet" });

    return () => {
      console.log("Unsubscribing from wallet updates...");
      worker.port.postMessage({ action: "unsubscribe", key: "wallet" });
      worker.port.close();
    };
  }, []);

  const handleClearData = () => {
    setWallets([]);
    sessionStorage.removeItem("walletData");
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: theme.palette.background.primary,
      color: theme.palette.text.primary,
      }}>
      {/* Верхняя строка с кнопками */}
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'left', padding: 2 }}>
        {/* Button to open filter settings */}
        <Button variant="outlined" >
          Open Filter Settings
        </Button>
  
        {/* Button to clear data */}
        <Button variant="outlined" onClick={handleClearData} sx={{ marginLeft: 2 }}>
          Clear Data
        </Button>
      </Box>

      <DataGrid
        rows={wallets}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        checkboxSelection
        disableSelectionOnClick
      />
    </Box>
  );
};

export default Wallet;
