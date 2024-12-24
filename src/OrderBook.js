import React, { useState, useEffect} from "react";
// import { ThemeContext } from "./ThemeContext"; // Подключение контекста темы
import { useTheme } from "@mui/material/styles"; // Подключение темы
import "./OrderBook.css";

const OrderBook = () => {
  const [buyOrders, setBuyOrders] = useState([]);
  const [sellOrders, setSellOrders] = useState([]);
  // const { isDarkMode } = useContext(ThemeContext); // Используем тему из контекста
  const theme = useTheme(); // Доступ к теме

  useEffect(() => {
    const connectWebSocket = () => {
      const socket = new WebSocket("ws://localhost:10999/orderbook");

      socket.onopen = () => {
        console.log("WebSocket connected");
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.buyOrders && data.sellOrders) {
            setBuyOrders(data.buyOrders);
            setSellOrders(data.sellOrders);
          }
        } catch (err) {
          console.error("Error parsing message:", err);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socket.onclose = (event) => {
        console.log(`WebSocket disconnected: code=${event.code}, reason=${event.reason}`);
        setTimeout(() => {
          console.log("Reconnecting...");
          //connectWebSocket(); // Попытка переподключения
        }, 3000);
      };

      return socket;
    };

    //const socket = connectWebSocket();
    return () => {
      console.log("Component unmounted");
      //socket.close();
    };
  }, []);

  return (
    // <div className={`order-book ${isDarkMode ? "dark-mode" : "light-mode"}`}>
    <div
      className="order-book"
      style={{
        backgroundColor: theme.palette.background.secondary, // Использование цвета фона
        color: theme.palette.text.secondary, // Использование цвета текста
        transition: "background-color 0.3s, color 0.3s", // Плавный переход
        marginTop: "20px", // Добавляем отступ сверху
        border: "1px solid " + theme.palette.divider, // Добавляем границу с цветом из палитры
        borderRadius: "8px", // Опционально: добавляем скругление углов
      }}
    >
      <h2>Order Book</h2>
      <div className="order-book-grid">
        {/* Buy Orders */}
        <div className="order-column">
          <h3>Buy Orders</h3>
          <table>
            <thead>
              <tr>
                <th>Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {buyOrders.map((order, index) => (
                <tr key={index}>
                  <td className="buy-price">{order.price.toFixed(2)}</td>
                  <td>{order.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sell Orders */}
        <div className="order-column">
          <h3>Sell Orders</h3>
          <table>
            <thead>
              <tr>
                <th>Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {sellOrders.map((order, index) => (
                <tr key={index}>
                  <td className="sell-price">{order.price.toFixed(2)}</td>
                  <td>{order.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
