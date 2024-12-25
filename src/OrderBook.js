import React, { useState, useEffect } from "react";
import { Box, Typography, Checkbox, FormControlLabel, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const OrderBook = () => {
  const defaultOrderBook = [
    { id: 1, exchange: "binance", pair: "BTC/USDT", bestBid: "Fetching data...", bestOffer: "Fetching data...", spread: "Fetching data..." },
    { id: 2, exchange: "binance", pair: "ETH/USDT", bestBid: "Fetching data...", bestOffer: "Fetching data...", spread: "Fetching data..." },
    { id: 3, exchange: "bybit", pair: "XRP/USDT", bestBid: "Fetching data...", bestOffer: "Fetching data...", spread: "Fetching data..." },
  ];

  const [orderBook, setOrderBook] = useState(defaultOrderBook);
  const [filterModel, setFilterModel] = useState({
    items: [
      { columnField: "exchange", operatorValue: "contains", value: "" },
      { columnField: "pair", operatorValue: "contains", value: "" },
      { columnField: "bestBid", operatorValue: "contains", value: "" },
      { columnField: "bestOffer", operatorValue: "contains", value: "" },
      { columnField: "spread", operatorValue: "contains", value: "" },
    ],
  });
  const [caseSensitive, setCaseSensitive] = useState(false); // State for the case-sensitive checkbox
  const [openFilterDialog, setOpenFilterDialog] = useState(false); // State to open/close filter dialog

  const columns = [
    { field: "exchange", headerName: "Exchange", width: 150 },
    { field: "pair", headerName: "Trading Pair", width: 150 },
    { field: "bestBid", headerName: "Best Bid", width: 150 },
    { field: "bestOffer", headerName: "Best Offer", width: 150 },
    { field: "spread", headerName: "Spread", width: 150 },
  ];

  // Simulating WebSocket connection
  useEffect(() => {
    const socket = new WebSocket("ws://your-websocket-url");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { exchange, pair, bestBid, bestOffer, spread } = data;

      setOrderBook((prevOrderBook) =>
        prevOrderBook.map((order) =>
          order.exchange === exchange && order.pair === pair
            ? { ...order, bestBid, bestOffer, spread }
            : order
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
  const filteredRows = orderBook.filter((order) => {
    return filterModel.items.every((filter) => {
      const { columnField, operatorValue, value } = filter;

      // Get the cell value and convert it to a string
      const cellValue = order[columnField] ? order[columnField].toString() : "";
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
      <Button
        variant="outlined"
        color="primary"
        onClick={handleOpenFilterDialog}
        sx={{ marginBottom: 2 }} // Adds 20px bottom margin
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

export default OrderBook;
