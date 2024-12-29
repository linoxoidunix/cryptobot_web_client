import React, { useState, useEffect } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Checkbox } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";


const Pnl = () => {
  const loadSavedPNLData = () => {
    const savedPNLData = sessionStorage.getItem("pnlData");
    return savedPNLData ? JSON.parse(savedPNLData) : [];
  };

  const [pnlData, setPnlData] = useState(loadSavedPNLData());
  const [filterModel, setFilterModel] = useState({
    items: [
      { columnField: "exchange", operatorValue: "contains", value: "" },
    ],
  });
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [filteredRows, setFilteredRows] = useState(pnlData);
  const theme = useTheme(); // Получаем текущую тему из контекста

  const columns = [
    { field: "exchange", headerName: "Exchange", width: 150 },
    { field: "pair", headerName: "Trading Pair", width: 150 },
    { field: "realized", headerName: "Realized", width: 150 },
    { field: "unrealized", headerName: "Unrealized", width: 150 },
    { field: "lastUpdate", headerName: "Last Update", width: 180 },
  ];

  // WebSocket data simulation
  useEffect(() => {
    console.log("Initializing SharedWorker for PNL data...");
  
    const worker = new SharedWorker("/sharedworker.js");
  
    // Listen for messages from the SharedWorker
    worker.port.onmessage = (event) => {
      console.log("Received message from SharedWorker:", event.data);
  
      const data = event.data;
  
      // Validate that the data contains the necessary keys
      const { exchange, trading_pair, realized, unrealized } = data || {};
      const currentTime = new Date().toLocaleString();
  
      if (exchange && trading_pair && realized && unrealized) {
        setPnlData((prevPNLData) => {
          const existingIndex = prevPNLData.findIndex(
            (obj) => obj.exchange === exchange && obj.pair === trading_pair
          );
  
          if (existingIndex !== -1) {
            // Update the existing record
            const updatedPNLData = prevPNLData.map((obj, index) =>
              index === existingIndex
                ? {
                    ...obj,
                    realized,
                    unrealized,
                    lastUpdate: currentTime,
                  }
                : obj
            );
            sessionStorage.setItem("pnlData", JSON.stringify(updatedPNLData));
            return updatedPNLData;
          } else {
            // Add a new record
            const newPNLData = [
              ...prevPNLData,
              {
                id: Date.now(),
                exchange,
                pair: trading_pair,
                realized,
                unrealized,
                lastUpdate: currentTime,
              },
            ];
            sessionStorage.setItem("pnlData", JSON.stringify(newPNLData));
            return newPNLData;
          }
        });
      } else {
        console.warn("Invalid PNL data received:", data);
      }
    };
  
    // Subscribe to PNL updates in SharedWorker
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
      const newFilteredRows = pnlData.filter((pnl) => {
        if (!columnField || !operatorValue || !value) return true;

        const cellValue = pnl[columnField]?.toString() || "";
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
            } catch (e) {
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
  }, [filterModel, caseSensitive, pnlData]);

  // Handling filter model change
  const handleFilterModelChange = (newFilterModel) => {
    if (JSON.stringify(newFilterModel.items) !== JSON.stringify(filterModel.items)) {
      setFilterModel(newFilterModel);
    }
  };

  // Handling case-sensitive checkbox change
  const handleCaseSensitiveChange = (event) => {
    setCaseSensitive(event.target.checked);
  };

  // Handling filter dialog open/close
  const handleOpenFilterDialog = () => {
    setOpenFilterDialog(true);
  };

  const handleCloseFilterDialog = () => {
    setOpenFilterDialog(false);
  };

  // Clear all data in DataGrid
  const handleClearData = () => {
    setPnlData([]);
    setFilteredRows([]);
    sessionStorage.removeItem("pnlData");
  };

  return (
    <Box 
      sx={{
        height: "100%",
        padding: 2,
        backgroundColor: theme.palette.background.primary, // Основной фон
        color: theme.palette.text.primary, // Основной текст
      }}
    >
      <Button
        variant="outlined"
        onClick={handleOpenFilterDialog}
      >
        Open Filter Settings
      </Button>

      <Button
        variant="outlined"
        onClick={handleClearData}
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
                onChange={handleCaseSensitiveChange}
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

export default Pnl;
