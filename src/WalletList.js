import React, { useState, useEffect } from "react";
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const WalletList = () => {
  const loadSavedWalletData = () => {
    const savedWalletData = localStorage.getItem("walletData");
    return savedWalletData ? JSON.parse(savedWalletData) : [];
  };

  const [wallets, setWallets] = useState(loadSavedWalletData());
  const [filterModel, setFilterModel] = useState({
    items: [{ columnField: "exchange", operatorValue: "contains", value: "" }],
  });
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [filteredRows, setFilteredRows] = useState(wallets);

  const columns = [
    { field: "exchange", headerName: "Exchange", width: 150 },
    { field: "ticker", headerName: "Ticker", width: 150 },
    { field: "value", headerName: "Value", width: 200 },
  ];

  // WebSocket data simulation
  useEffect(() => {
    console.log("Initializing SharedWorker for PNL data...");

    const worker = new SharedWorker("/sharedworker.js");

    // Слушаем сообщения от SharedWorker
    worker.port.onmessage = (event) => {
      console.log("Received message from SharedWorker:", event.data);

      const data = event.data;

      // Проверяем, что данные содержат необходимые ключи
      const { exchange, trading_pair, realized, unrealized } = data || {};
      const currentTime = new Date().toLocaleString();

      if (exchange && trading_pair && realized !== undefined && unrealized !== undefined) {
        setWallets((prevWalletData) => {
          const existingIndex = prevWalletData.findIndex(
            (pnl) => pnl.exchange === exchange && pnl.pair === trading_pair
          );

          if (existingIndex !== -1) {
            // Обновляем существующую запись
            const updatedPNLData = prevWalletData.map((pnl, index) =>
              index === existingIndex
                ? {
                    ...pnl,
                    realized,
                    unrealized,
                    lastUpdate: currentTime,
                  }
                : pnl
            );
            localStorage.setItem("walletData", JSON.stringify(updatedPNLData));
            return updatedPNLData;
          } else {
            // Добавляем новую запись
            const newWalletData = [
              ...prevWalletData,
              {
                id: Date.now(),
                exchange,
                pair: trading_pair,
                realized,
                unrealized,
                lastUpdate: currentTime,
              },
            ];
            localStorage.setItem("walletData", JSON.stringify(newWalletData));
            return newWalletData;
          }
        });
      } else {
        console.warn("Invalid PNL data received:", data);
      }
    };

    // Подписываемся на обновления PNL в SharedWorker
    worker.port.postMessage({ action: "subscribe", key: "pnl" });

    return () => {
      console.log("Unsubscribing from PNL updates...");
      worker.port.postMessage({ action: "unsubscribe", key: "pnl" });
      worker.port.close();
    };
  }, []);
  

  // Apply filters
  useEffect(() => {
    const applyFilters = () => {
      const { columnField, operatorValue, value } = filterModel.items[0] || {};
      const newFilteredRows = wallets.filter((wallet) => {
        if (!columnField || !operatorValue || !value) return true;

        const cellValue = wallet[columnField]?.toString() || "";
        const compareValue = caseSensitive ? cellValue : cellValue.toLowerCase();
        const compareFilter = caseSensitive ? value : value.toLowerCase();

        switch (operatorValue) {
          case "contains":
            return compareValue.includes(compareFilter);
          case "equals":
            return compareValue === compareFilter;
          case "regex":
            try {
              const regex = new RegExp(value, caseSensitive ? "" : "i");
              return regex.test(cellValue);
            } catch {
              console.error("Invalid regex:", value);
              return false;
            }
          default:
            return true;
        }
      });

      setFilteredRows(newFilteredRows);
    };

    applyFilters();
  }, [filterModel, caseSensitive, wallets]);

  // Handle filter model changes
  const handleFilterModelChange = (newFilterModel) => {
    if (JSON.stringify(newFilterModel.items) !== JSON.stringify(filterModel.items)) {
      setFilterModel(newFilterModel);
    }
  };

  // Handle clearing data
  const handleClearData = () => {
    setWallets([]);
    setFilteredRows([]);
    localStorage.removeItem("walletData");
  };

  // Handle dialog open/close
  const handleOpenFilterDialog = () => setOpenFilterDialog(true);
  const handleCloseFilterDialog = () => setOpenFilterDialog(false);

  return (
    <Box sx={{ height: "100%", padding: 2 }}>
      <Button
        variant="outlined"
        color="primary"
        onClick={handleOpenFilterDialog}
        sx={{ marginBottom: 2 }}
      >
        Open Filter Settings
      </Button>

      <Button
        variant="outlined"
        color="secondary"
        onClick={handleClearData}
        sx={{ marginBottom: 2, marginLeft: 2 }}
      >
        Clear Data
      </Button>

      <Dialog open={openFilterDialog} onClose={handleCloseFilterDialog}>
        <DialogTitle>Filter Settings</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Checkbox
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                color="primary"
              />
            }
            label="Case Sensitive"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFilterDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <DataGrid
        rows={filteredRows}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        checkboxSelection
        disableSelectionOnClick
        filterModel={filterModel}
        onFilterModelChange={handleFilterModelChange}
      />
    </Box>
  );
};

export default WalletList;
