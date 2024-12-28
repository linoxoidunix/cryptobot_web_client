import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";

const PnL = ({ exchange, pair }) => {
  const [pnl, setPnL] = useState({}); // Состояние для PnL
  const [isConnected, setIsConnected] = useState(false); // Состояние подключения
  const theme = useTheme(); // Использование темы MUI

  useEffect(() => {
    const connectWebSocket = () => {
        const socket = new WebSocket("ws://localhost:10999/ws");

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
    <div
      style={{
        backgroundColor: theme.palette.background.paper, // Цвет фона из темы
        color: theme.palette.text.primary, // Цвет текста из темы
        transition: "background-color 0.3s, color 0.3s", // Плавные переходы
        marginTop: "20px",
        border: `1px solid ${theme.palette.divider}`, // Граница из темы
        borderRadius: "8px",
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
        <div>
          <h4>Profit and Loss (PnL):</h4>
          <p>
            Unrealized PnL: <strong>{pnl.unrealized || 0}</strong>
          </p>
          <p>
            Realized PnL: <strong>{pnl.realized || 0}</strong>
          </p>
        </div>
      ) : (
        <p style={{ color: theme.palette.error.main }}>Connecting to server...</p>
      )}
    </div>
  );
};

export default PnL;
