import React, { useContext, useState } from "react";
import {
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";
// import { useTheme } from "@mui/material/styles"; // Подключение темы
import { ThemeContext } from "./ThemeContext";
import OrderBook from "./OrderBook.js";
import WalletList from "./WalletList";
import PnLList from "./PnLList";

const App = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [orderBooks, setOrderBooks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ exchange: "", pair: "" });
  const [tabValue, setTabValue] = useState(0);
  // const theme = useTheme(); // Доступ к теме

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ exchange: "", pair: "" });
  };

  const handleAddOrderBook = () => {
    const { exchange, pair } = formData;
    if (exchange && pair) {
      setOrderBooks((prev) => [...prev, { id: prev.length + 1, exchange, pair }]);
      closeModal();
    } else {
      alert("Please fill out both fields.");
    }
  };

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box
      sx={{
        backgroundColor: (theme) => theme.palette.background.primary,
        minHeight: "100vh",
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
      {/* {tabValue === 0 && (
        <div className="orderbook-container">
          <Button
            variant="contained"
            color="primary"
            onClick={openModal}
            style={{ marginBottom: "20px" }}
          >
            Add OrderBook
          </Button>

          <div 
            className="orderbook-list"
          >
            {orderBooks.length === 0 ? (
              <p>No order books available.</p>
            ) : (
              orderBooks.map((book, index) => (
                <OrderBook
                  key={book.id}
                  exchange={book.exchange}
                  pair={book.pair}
                />
              ))
            )}
          </div>
        </div>
      )} */}
      {tabValue === 0 && <OrderBook />}
      {tabValue === 1 && <PnLList />}
      {tabValue === 2 && <WalletList />}
      {tabValue === 3 && <h2>Dashboard Content</h2>}
      {tabValue === 4 && <h2>Settings</h2>}

      {/* Модальное окно */}
      <Dialog open={isModalOpen} onClose={closeModal}>
        <DialogTitle>Add New OrderBook</DialogTitle>
        <DialogContent>
          {/* Выбор биржи */}
          <FormControl fullWidth style={{ marginBottom: "20px" }}>
            <InputLabel>Select Exchange</InputLabel>
            <Select
              value={formData.exchange}
              onChange={(e) =>
                setFormData({ ...formData, exchange: e.target.value })
              }
            >
              <MenuItem value="">Choose exchange</MenuItem>
              <MenuItem value="binance">Binance</MenuItem>
              <MenuItem value="bybit">Bybit</MenuItem>
            </Select>
          </FormControl>

          {/* Выбор торговой пары */}
          <FormControl fullWidth>
            <InputLabel>Select Trading Pair</InputLabel>
            <Select
              value={formData.pair}
              onChange={(e) =>
                setFormData({ ...formData, pair: e.target.value })
              }
            >
              <MenuItem value="">Choose trading pair</MenuItem>
              <MenuItem value="BTC/USDT">BTC/USDT</MenuItem>
              <MenuItem value="ETH/USDT">ETH/USDT</MenuItem>
              <MenuItem value="XRP/USDT">XRP/USDT</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleAddOrderBook}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default App;
