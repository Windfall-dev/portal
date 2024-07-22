import React, { useCallback, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export const ThirdPartyWallet: React.FC = () => {
  const { publicKey, signMessage } = useWallet();
  const [signedMessage, setSignedMessage] = useState("");

  const handleSignMessage = useCallback(async () => {
    if (publicKey && signMessage) {
      try {
        const message = new TextEncoder().encode("Test sign for Windfall.");
        const signature = await signMessage(message);
        setSignedMessage(Buffer.from(signature).toString("base64"));
      } catch (error) {
        console.error(error);
        setSignedMessage("Failed to sign message.");
      }
    }
  }, [publicKey, signMessage]);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Connect Your Phantom Wallet</h2>
      <WalletMultiButton />
      {publicKey && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Connected Wallet</h3>
          <p className="text-sm break-all">{publicKey.toString()}</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={handleSignMessage}
          >
            Sign Message
          </button>
          {signedMessage && (
            <div className="mt-4 p-4 bg-green-100 rounded-md">
              <h4 className="text-lg font-semibold">Signed Message</h4>
              <p className="text-sm break-all">{signedMessage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
