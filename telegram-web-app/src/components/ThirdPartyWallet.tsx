import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export const ThirdPartyWallet: React.FC = () => {
  const { publicKey } = useWallet();

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Connect Your Phantom Wallet</h2>
      <WalletMultiButton />
      {publicKey && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Connected Wallet</h3>
          <p className="text-sm break-all">{publicKey.toString()}</p>
        </div>
      )}
    </div>
  );
};
