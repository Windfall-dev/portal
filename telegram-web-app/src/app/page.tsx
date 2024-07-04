"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { Game } from "@/types/game";
import { BackButton } from "@/components/BackButton";
import { GameCard } from "@/components/GameCard";
import { GameModal } from "@/components/GameModal";
import { games } from "./data";
import { Footer } from "@/components/Footer";
import { ProgrammableWallet } from "@/components/ProgrammableWallet";
import { ThirdPartyWallet } from "@/components/ThirdPartyWallet";
import { signIn, useSession } from "next-auth/react";
import { RankingTable } from "@/components/RankingTable";

require("@solana/wallet-adapter-react-ui/styles.css");

const WindfallGameUI: React.FC = () => {
  const [tgWebApp, setTgWebApp] = useState<TelegramWebApp | null>(null);

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showWallet, setShowWallet] = useState<boolean>(false);
  const [walletType, setWalletType] = useState<"programmable" | "phantom">(
    "programmable"
  );

  const handleGameClick = (game: Game) => {
    setSelectedGame(game);
  };

  const handleCloseModal = () => {
    setSelectedGame(null);
  };

  const handleStartGame = () => {
    setIsPlaying(true);
  };

  // Solana wallet setup
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = clusterApiUrl(network);
  const wallets = [new PhantomWalletAdapter()];

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tgWebApp = window.Telegram.WebApp;
      setTgWebApp(tgWebApp);
      tgWebApp.ready();
      if (tgWebApp.initData) {
        signIn("credentials", {
          redirect: false,
          initData: tgWebApp.initData,
        }).then((result) => {
          if (!result?.ok) {
            toast.error("Failed to sign in");
          } else {
            toast.success("Signed in successfully");
          }
        });
      } else {
        toast.error("Telegram initData not found");
      }
    } else {
      toast.error("Telegram WebApp not found");
    }
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="flex flex-col min-h-screen bg-yellow-400">
            <header className="bg-yellow-400 p-4 flex justify-between items-center">
              <p className="text-lg font-bold">WindFall</p>
              {!showWallet && !isPlaying && (
                <button
                  onClick={() => setShowWallet(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Show Wallet
                </button>
              )}
            </header>

            <main className="flex-grow bg-white relative">
              {isPlaying ? (
                <div className="relative w-screen h-[calc(100vh-4rem)]">
                  <iframe
                    src="https://lootadventure-stage.vercel.app/game/prod/index.html"
                    className="w-full h-full"
                  />
                  <BackButton onClick={() => setIsPlaying(false)} />
                </div>
              ) : showWallet ? (
                <div className="p-4">
                  <BackButton onClick={() => setShowWallet(false)} />
                  <div className="flex justify-center mb-4">
                    <select
                      value={walletType}
                      onChange={(e) =>
                        setWalletType(
                          e.target.value as "programmable" | "phantom"
                        )
                      }
                      className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-5 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition duration-150 ease-in-out"
                    >
                      <option value="programmable">Programmable Wallet</option>
                      <option value="phantom">Phantom Wallet</option>
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                  </div>
                  {walletType === "programmable" ? (
                    <ProgrammableWallet />
                  ) : (
                    <ThirdPartyWallet />
                  )}
                </div>
              ) : (
                <div className="p-4">
                  <h2 className="text-2xl font-bold mb-4">
                    Season1 Picked Games
                  </h2>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {games.map((game) => (
                      <GameCard
                        key={game.id}
                        game={game}
                        onClick={handleGameClick}
                      />
                    ))}
                  </div>
                  <h2 className="text-2xl font-bold mb-4">
                    Today's Picked Games Ranking
                  </h2>
                  <RankingTable />
                </div>
              )}
            </main>
            {!isPlaying && !showWallet && <Footer />}
            {selectedGame && !isPlaying && !showWallet && (
              <GameModal
                game={selectedGame}
                onClose={handleCloseModal}
                onStart={handleStartGame}
              />
            )}

            <ToastContainer />
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WindfallGameUI;
