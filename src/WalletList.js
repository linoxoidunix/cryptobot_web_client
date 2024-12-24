import React, { useState} from "react";
import Wallet from "./Wallet";

const WalletList = () => {
  const defaultWallets = [
    { exchange: "binance", pair: "BTC/USDT" },
    { exchange: "binance", pair: "ETH/USDT" },
    { exchange: "bybit", pair: "XRP/USDT" },
  ];

  const [wallets, setWallets] = useState(defaultWallets);

  return (
    <div className="wallet-list">
      {wallets.map((wallet, index) => (
        <Wallet key={index} exchange={wallet.exchange} pair={wallet.pair} />
      ))}
    </div>
  );
};

export default WalletList;
