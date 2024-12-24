import React, { useContext, useState, useEffect } from "react";
import { ThemeContext } from "./ThemeContext";
import "./Wallet.css"; // Стили для Wallet

const Wallet = ({ exchange, pair }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [balance, setBalance] = useState({}); // Баланс для пары
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connectWebSocket = () => {
      const socket = new WebSocket(`ws://localhost:10999/wallet/${exchange}/${pair}`);

      socket.onopen = () => {
        console.log(`WebSocket connected for ${exchange} ${pair}`);
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.balance) {
            setBalance(data.balance);
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
    <div className={`wallet ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      <p>
        Exchange: <strong>{exchange}</strong>
      </p>
      <p>
        Pair: <strong>{pair}</strong>
      </p>
      {isConnected ? (
        <div className="wallet-balance">
          <h4>Balance:</h4>
          <p>
            Base Asset: <strong>{balance.base || 0}</strong>
          </p>
          <p>
            Quote Asset: <strong>{balance.quote || 0}</strong>
          </p>
        </div>
      ) : (
        <p className="connection-status">Connecting to server...</p>
      )}
    </div>
  );
};

export default Wallet;
