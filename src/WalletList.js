import React, { useState, useEffect } from "react";
import { Box, Typography, Checkbox, FormControlLabel, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const WalletList = () => {
  const defaultWallets = [
    { id: 1, exchange: "binance", pair: "BTC/USDT", value: "Fetching data..." },
    { id: 2, exchange: "binance", pair: "ETH/USDT", value: "Fetching data..." },
    { id: 3, exchange: "bybit", pair: "XRP/USDT", value: "Fetching data..." },
  ];

  const [wallets, setWallets] = useState(defaultWallets);
  const [filterModel, setFilterModel] = useState({
    items: [
      { columnField: "exchange", operatorValue: "contains", value: "" },
      { columnField: "pair", operatorValue: "contains", value: "" },
      { columnField: "value", operatorValue: "contains", value: "" },
    ],
  });
  const [caseSensitive, setCaseSensitive] = useState(false); // State for the case-sensitive checkbox
  const [openFilterDialog, setOpenFilterDialog] = useState(false); // State to open/close filter dialog

  const columns = [
    { field: "exchange", headerName: "Exchange", width: 150 },
    { field: "pair", headerName: "Trading Pair", width: 150 },
    { field: "value", headerName: "Value", width: 200 },
  ];

  // Simulating WebSocket connection
  useEffect(() => {
    const socket = new WebSocket("ws://your-websocket-url");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { exchange, pair, value } = data;

      setWallets((prevWallets) =>
        prevWallets.map((wallet) =>
          wallet.exchange === exchange && wallet.pair === pair
            ? { ...wallet, value: value }
            : wallet
        )
      );
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleFilterModelChange = (newFilterModel) => {
    if (JSON.stringify(newFilterModel.items) !== JSON.stringify(filterModel.items)) {
      setFilterModel(newFilterModel);
    }
  };

  const handleCaseSensitiveChange = (event) => {
    setCaseSensitive(event.target.checked); // Update checkbox state for case sensitivity
  };

  const handleOpenFilterDialog = () => {
    setOpenFilterDialog(true); // Open the filter settings dialog
  };

  const handleCloseFilterDialog = () => {
    setOpenFilterDialog(false); // Close the filter dialog
  };

  // Filtering the rows based on the filter model and case sensitivity
  const filteredRows = wallets.filter((wallet) => {
    return filterModel.items.every((filter) => {
      const { columnField, operatorValue, value } = filter;

      // Get the cell value and convert it to a string
      const cellValue = wallet[columnField] ? wallet[columnField].toString() : "";
      const filterValue = value ? value : ""; // Use filter value if provided

      const compareValue = caseSensitive ? cellValue : cellValue.toLowerCase(); // Check for case sensitivity
      const compareFilter = caseSensitive ? filterValue : filterValue.toLowerCase();

      switch (operatorValue) {
        case "contains":
          return compareValue.includes(compareFilter); // Apply filtering with case sensitivity
        case "equals":
          return compareValue === compareFilter;
        case "regex": // Added regex support
          try {
            const regex = new RegExp(filterValue, "i"); // "i" flag for ignoring case
            return regex.test(cellValue);
          } catch (error) {
            console.error("Invalid regular expression:", filterValue);
            return false; // In case of invalid regex, skip the row
          }
        default:
          return true;
      }
    });
  });

  return (
    <Box sx={{ height: 400, padding: 2 }}>
      {/* Button to open filter settings dialog */}
      <Button variant="outlined" color="primary" onClick={handleOpenFilterDialog}
          sx={{ marginBottom: 2 }} // Adds 20px bottom margin (equivalent to 2 spacing units in Material UI)
          >
        Open Filter Settings
      </Button>

      {/* Filter settings dialog */}
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
        pageSize={5}
        rowsPerPageOptions={[5]}
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

export default WalletList;
