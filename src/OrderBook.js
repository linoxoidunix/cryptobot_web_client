import React, { useState, useEffect } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Checkbox } from "@mui/material";
import { DataGrid, useResizeContainer } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { useSubscription } from "./App";

const OrderBook = () => {
  const loadSavedOrderBook = () => {
    const savedOrderBook = sessionStorage.getItem("orderBook");
    return savedOrderBook ? JSON.parse(savedOrderBook) : [];
  };

  const [orderBook, setOrderBook] = useState(loadSavedOrderBook());
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const theme = useTheme(); // Получаем текущую тему из контекста
  const subscriptionService = useSubscription();

  const columns = [
    { field: "exchange", headerName: "Exchange", width: 150 },
    { field: "pair", headerName: "Trading Pair", width: 150 },
    { field: "bestBid", headerName: "Best Bid", width: 150 },
    { field: "bestOffer", headerName: "Best Offer", width: 150 },
    { field: "spread", headerName: "Spread", width: 150 },
    { field: "lastUpdate", headerName: "Last Update", width: 180 },
  ];

  useEffect(() => {
    const handleUpdate = (data) => {
    console.log("Received data:", data); // Проверим, что данные приходят
      const { exchange, trading_pair, best_bid, best_offer, spread } = data || {};
      const currentTime = new Date().toLocaleString();
      if (exchange && trading_pair && best_bid && best_offer && spread) {
        setOrderBook((prev) => {
          const existingIndex = prev.findIndex(
            (order) => order.exchange === exchange && order.pair === trading_pair
          );
          if (existingIndex !== -1) {
            return prev.map((order, index) =>
              index === existingIndex
                ? { ...order, bestBid: best_bid, bestOffer: best_offer, spread, lastUpdate: currentTime }
                : order
            );
          }
          return [
            ...prev,
            { id: `${exchange}-${trading_pair}`, exchange, pair: trading_pair, bestBid: best_bid, bestOffer: best_offer, spread, lastUpdate: currentTime },
          ];
        });
      }
    };

    console.log("Subscribing to orderbook...");
    subscriptionService.subscribe("orderbook", handleUpdate);
  
    return () => subscriptionService.unsubscribe("orderbook", handleUpdate);
  }, [subscriptionService]);

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
    setOrderBook([]); // Clear order book data
    sessionStorage.removeItem("orderBook"); // Clear sessionStorage as well
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
  
      {/* Filter dialog */}
      <Dialog open={openFilterDialog} onClose={handleCloseFilterDialog}>
        <DialogTitle sx={{ color: theme.palette.text.primary }}>
          Filter Settings
        </DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Checkbox
                checked={caseSensitive}
                onChange={handleCaseSensitiveChange}
                sx={{
                  color: theme.palette.text.secondary,
                  "&.Mui-checked": { color: theme.palette.text.primary },
                }}
              />
            }
            label="Case Sensitive"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseFilterDialog}
            sx={{
              color: theme.palette.text.primary,
              borderColor: theme.palette.text.secondary,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
  
      {/* DataGrid with themed styles */}
      <DataGrid
        rows={orderBook}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        checkboxSelection
        disableSelectionOnClick
      />
    </Box>
  );
  
};

export default OrderBook;
