import React, { useState, useEffect } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Checkbox } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const OrderBook = () => {
  const loadSavedOrderBook = () => {
    const savedOrderBook = localStorage.getItem("orderBook");
    return savedOrderBook ? JSON.parse(savedOrderBook) : [];
  };

  const [orderBook, setOrderBook] = useState(loadSavedOrderBook());
  const [filterModel, setFilterModel] = useState({
    items: [
      { columnField: "exchange", operatorValue: "contains", value: "" },
    ],
  });
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [filteredRows, setFilteredRows] = useState(orderBook);

  const columns = [
    { field: "exchange", headerName: "Exchange", width: 150 },
    { field: "pair", headerName: "Trading Pair", width: 150 },
    { field: "bestBid", headerName: "Best Bid", width: 150 },
    { field: "bestOffer", headerName: "Best Offer", width: 150 },
    { field: "spread", headerName: "Spread", width: 150 },
    { field: "lastUpdate", headerName: "Last Update", width: 180 },
  ];

  // WebSocket data simulation
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:10999/ws");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { exchange, trading_pair, best_bid, best_offer, spread } = data.orderBook;
      const currentTime = new Date().toLocaleString(); // Get current time for "Last Update"

      setOrderBook((prevOrderBook) => {
        const existingIndex = prevOrderBook.findIndex(
          (order) => order.exchange === exchange && order.pair === trading_pair
        );
        
        if (existingIndex !== -1) {
          const updatedOrderBook = prevOrderBook.map((order, index) =>
            index === existingIndex
              ? { 
                  ...order, 
                  bestBid: best_bid, 
                  bestOffer: best_offer, 
                  spread, 
                  lastUpdate: currentTime // Update lastUpdate field
                }
              : order
          );
          localStorage.setItem("orderBook", JSON.stringify(updatedOrderBook)); // Save updated data to localStorage
          return updatedOrderBook;
        } else {
          const newOrderBook = [
            ...prevOrderBook,
            { 
              id: Date.now(), 
              exchange, 
              pair: trading_pair, 
              bestBid: best_bid, 
              bestOffer: best_offer, 
              spread, 
              lastUpdate: currentTime // Add lastUpdate field
            },
          ];
          localStorage.setItem("orderBook", JSON.stringify(newOrderBook)); // Save new data to localStorage
          return newOrderBook;
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
      const newFilteredRows = orderBook.filter((order) => {
        if (!columnField || !operatorValue || !value) return true;

        const cellValue = order[columnField]?.toString() || "";
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
  }, [filterModel, caseSensitive, orderBook]);

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
    setOrderBook([]);  // Clear order book data
    setFilteredRows([]);  // Clear filtered rows
    localStorage.removeItem("orderBook"); // Clear localStorage as well
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

      {/* Button to clear data */}
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

export default OrderBook;
