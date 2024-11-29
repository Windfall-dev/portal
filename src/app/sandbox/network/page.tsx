"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import React, { useState } from "react";

import { NETWORKS } from "@/lib/solana-wallet";

const NetworkSelector: React.FC = () => {
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [balance, setBalance] = useState<number>(0);
  const { publicKey } = useWallet();

  const fetchBalance = async (network: string) => {
    try {
      if (!publicKey) {
        console.log("Wallet not connected");
        return;
      }
      const connection = new Connection(network);
      // You'll need to get the wallet's public key here
      const balance = await connection.getBalance(publicKey);
      console.log(`SOL Balance: ${balance / LAMPORTS_PER_SOL}`);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newNetwork = event.target.value;
    setSelectedNetwork(newNetwork);
    if (newNetwork) {
      fetchBalance(newNetwork);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="network-select" className="text-sm font-medium">
        Select Network:
      </label>
      <select
        id="network-select"
        value={selectedNetwork}
        onChange={handleChange}
        className="dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md border bg-white p-2"
      >
        <option value="">Select a network</option>
        {NETWORKS.map((network) => (
          <option key={network.value} value={network.value}>
            {network.chainId}
          </option>
        ))}
      </select>
      <p className="text-sm font-medium">Balance: {balance} SOL</p>
    </div>
  );
};

export default NetworkSelector;
