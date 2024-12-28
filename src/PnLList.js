import React, { useState, useEffect } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Checkbox } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const PNLList = () => {
  const loadSavedPNLData = () => {
    const savedPNLData = localStorage.getItem("pnlData");
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

  const columns = [
    { field: "exchange", headerName: "Exchange", width: 150 },
    { field: "pair", headerName: "Trading Pair", width: 150 },
    { field: "realized", headerName: "Realized", width: 150 },
    { field: "unrealized", headerName: "Unrealized", width: 150 },
    { field: "lastUpdate", headerName: "Last Update", width: 180 },
  ];

  // WebSocket data simulation
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:10999/ws");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { exchange, trading_pair, realized, unrealized } = data.pnl;
      const currentTime = new Date().toLocaleString();

      setPnlData((prevPNLData) => {
        const existingIndex = prevPNLData.findIndex(
          (pnl) => pnl.exchange === exchange && pnl.pair === trading_pair
        );

        if (existingIndex !== -1) {
          const updatedPNLData = prevPNLData.map((pnl, index) =>
            index === existingIndex
              ? {
                  ...pnl,
                  realized,
                  unrealized,
                  lastUpdate: currentTime,
                }
              : pnl
          );
          localStorage.setItem("pnlData", JSON.stringify(updatedPNLData));
          return updatedPNLData;
        } else {
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
          localStorage.setItem("pnlData", JSON.stringify(newPNLData));
          return newPNLData;
        }
      });
    };

    return () => {
      socket.close();
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
    localStorage.removeItem("pnlData");
  };

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
        onRowSelectionModelChange={(selection) => {
          console.log("Selected rows:", selection);
        }}
      />
    </Box>
  );
};

export default PNLList;
