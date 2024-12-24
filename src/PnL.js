import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles"; // Подключение темы
// import "./Wallet.css"; // Стили для PnL

const PnL = ({ exchange, pair }) => {
  const [pnl, setPnL] = useState({}); // PnL для пары
  const [isConnected, setIsConnected] = useState(false);
  const theme = useTheme(); // Доступ к теме

  useEffect(() => {
    const connectWebSocket = () => {
      const socket = new WebSocket(`ws://localhost:10999/pnl/${exchange}/${pair}`);

      socket.onopen = () => {
        console.log(`WebSocket connected for ${exchange} ${pair}`);
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.pnl) {
            setPnL(data.pnl);
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
        setIsConnected(false);
        setTimeout(() => {
          console.log("Reconnecting...");
          connectWebSocket(); // Попытка переподключения
        }, 3000);
      };

      return socket;
    };

    const socket = connectWebSocket();
    return () => socket.close(); // Закрыть WebSocket при размонтировании
  }, [exchange, pair]);

  return (
    <div  className="pnl"
        style={{
        backgroundColor: theme.palette.background.secondary, // Использование цвета фона
        color: theme.palette.text.secondary, // Использование цвета текста
        transition: "background-color 0.3s, color 0.3s", // Плавный переход
        marginTop: "20px", // Добавляем отступ сверху
        border: "1px solid " + theme.palette.divider, // Добавляем границу с цветом из палитры
        borderRadius: "8px", // Опционально: добавляем скругление углов
        padding: "20px",
        }}
      >
         <p>
            Exchange: <strong>{exchange}</strong>
        </p>
        <p>
            Pair: <strong>{pair}</strong>
        </p>
      {isConnected ? (
        <div className="pnl-data">
          <h4>Profit and Loss (PnL):</h4>
          <p>
            Unrealized PnL: <strong>{pnl.unrealized || 0}</strong>
          </p>
          <p>
            Realized PnL: <strong>{pnl.realized || 0}</strong>
          </p>
        </div>
      ) : (
        <p className="connection-status">Connecting to server...</p>
      )}
    </div>
  );
};

export default PnL;
