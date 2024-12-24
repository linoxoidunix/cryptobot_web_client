import React, { useState} from "react";
import PnL from "./PnL";

const PnLList = () => {
  const defaultPnL = [
    { exchange: "binance", pair: "BTC/USDT" },
    { exchange: "binance", pair: "ETH/USDT" },
    { exchange: "bybit", pair: "XRP/USDT" },
  ];

  const [wallets, ] = useState(defaultPnL);

  return (
    <div className="pnl-list">
      {wallets.map((wallet, index) => (
        <PnL key={index} exchange={wallet.exchange} pair={wallet.pair} />
      ))}
    </div>
  );
};

export default PnLList;
