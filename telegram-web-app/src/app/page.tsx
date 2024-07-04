"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Trophy, Home, Lock, ChevronDown } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

require("@solana/wallet-adapter-react-ui/styles.css");

interface Game {
  id: number;
  name: string;
  image: string;
  description: string;
}

const games: Game[] = [
  {
    id: 1,
    name: "COIN DASH!",
    image: "https://placehold.co/512x512",
    description:
      "COIN DASH is a side-scrolling action game. Try to win more coins by dodging obstacles flowing from the right.",
  },
  {
    id: 2,
    name: "Crashed",
    image: "https://placehold.co/512x512",
    description:
      "A fast-paced puzzle game where you clear blocks before they reach the top.",
  },
];

interface GameCardProps {
  game: Game;
  onClick: (game: Game) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onClick }) => (
  <div
    className="relative rounded-2xl overflow-hidden cursor-pointer"
    onClick={() => onClick(game)}
  >
    <img src={game.image} alt={game.name} className="w-full h-auto" />
    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-center">
      {game.name}
    </div>
  </div>
);

interface GameModalProps {
  game: Game;
  onClose: () => void;
  onStart: () => void;
}

const GameModal: React.FC<GameModalProps> = ({ game, onClose, onStart }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
      <img
        src={game.image}
        alt={game.name}
        className="w-24 h-24 mx-auto mb-4 rounded-2xl"
      />
      <h2 className="text-xl font-bold text-center mb-4">{game.name}</h2>
      <p className="text-center mb-6">{game.description}</p>
      <div className="flex justify-center space-x-4">
        <button
          onClick={onStart}
          className="bg-yellow-400 text-black font-bold py-2 px-6 rounded-full"
        >
          Start
        </button>
        <button
          onClick={onClose}
          className="bg-gray-200 text-black font-bold py-2 px-6 rounded-full"
        >
          Back
        </button>
      </div>
    </div>
  </div>
);

const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-4 left-4 bg-gray-200 text-black font-bold py-2 px-6 rounded-full"
  >
    Back
  </button>
);

const ConnectedWalletInfo: React.FC = () => {
  const { publicKey } = useWallet();

  if (!publicKey) return null;

  return (
    <div className="mt-4 p-4 bg-gray-100 rounded-md">
      <h3 className="text-lg font-semibold mb-2">Connected Wallet</h3>
      <p className="text-sm break-all">{publicKey.toString()}</p>
    </div>
  );
};

const WindfallGameUI: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showWallet, setShowWallet] = useState<boolean>(false);
  const [walletType, setWalletType] = useState<"programmable" | "phantom">(
    "programmable"
  );

  // SDK Test states
  const [sdk, setSdk] = useState<W3SSdk | null>(null);
  const [appId, setAppId] = useState<string>("");
  const [userToken, setUserToken] = useState<string>("");
  const [encryptionKey, setEncryptionKey] = useState<string>("");
  const [challengeId, setChallengeId] = useState<string>("");

  useEffect(() => {
    setSdk(new W3SSdk());

    // Set initial values from localStorage
    setAppId(window.localStorage.getItem("appId") || "someAppId");
    setUserToken(window.localStorage.getItem("userToken") || "someUserToken");
    setEncryptionKey(
      window.localStorage.getItem("encryptionKey") || "someEncryptionKey"
    );
    setChallengeId(
      window.localStorage.getItem("challengeId") || "someChallengeId"
    );
  }, []);

  const handleGameClick = (game: Game) => {
    setSelectedGame(game);
  };

  const handleCloseModal = () => {
    setSelectedGame(null);
  };

  const handleStartGame = () => {
    setIsPlaying(true);
  };

  const handleQuitGame = () => {
    setIsPlaying(false);
    setSelectedGame(null);
  };

  const onChangeHandler = useCallback(
    (setState: React.Dispatch<React.SetStateAction<string>>, key: string) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setState(value);
        window.localStorage.setItem(key, value);
      },
    []
  );

  const onSubmit = useCallback(() => {
    if (!sdk) return;
    sdk.setAppSettings({ appId });
    sdk.setAuthentication({ userToken, encryptionKey });
    sdk.execute(challengeId, (error, result) => {
      if (error) {
        toast.error(`Error: ${error?.message ?? "Error!"}`);
        return;
      }
      toast.success(`Challenge: ${result?.type}, Status: ${result?.status}`);
    });
  }, [sdk, appId, userToken, encryptionKey, challengeId]);

  // Solana wallet setup
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = clusterApiUrl(network);
  const wallets = [new PhantomWalletAdapter()];

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
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="appId"
                          className="block text-sm font-medium text-gray-700"
                        >
                          App Id
                        </label>
                        <input
                          type="text"
                          id="appId"
                          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          value={appId}
                          onChange={onChangeHandler(setAppId, "appId")}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="userToken"
                          className="block text-sm font-medium text-gray-700"
                        >
                          User Token
                        </label>
                        <input
                          type="text"
                          id="userToken"
                          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          value={userToken}
                          onChange={onChangeHandler(setUserToken, "userToken")}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="encryptionKey"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Encryption Key
                        </label>
                        <input
                          type="text"
                          id="encryptionKey"
                          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          value={encryptionKey}
                          onChange={onChangeHandler(
                            setEncryptionKey,
                            "encryptionKey"
                          )}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="challengeId"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Challenge Id
                        </label>
                        <input
                          type="text"
                          id="challengeId"
                          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          value={challengeId}
                          onChange={onChangeHandler(
                            setChallengeId,
                            "challengeId"
                          )}
                        />
                      </div>
                      <button
                        onClick={onSubmit}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Verify Challenge
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <h2 className="text-2xl font-bold mb-4">
                        Connect Your Phantom Wallet
                      </h2>
                      <WalletMultiButton />
                      <ConnectedWalletInfo />
                    </div>
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
                  {/* Add ranking table here */}
                </div>
              )}
            </main>

            {!isPlaying && !showWallet && (
              <footer className="bg-yellow-400 p-4">
                <div className="flex justify-around">
                  <button className="flex flex-col items-center">
                    <Trophy size={24} />
                    <span>LeaderBoard</span>
                  </button>
                  <button className="flex flex-col items-center">
                    <Home size={24} />
                    <span>Home</span>
                  </button>
                  <button className="flex flex-col items-center">
                    <Lock size={24} />
                    <span>Vaults</span>
                  </button>
                </div>
              </footer>
            )}

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
