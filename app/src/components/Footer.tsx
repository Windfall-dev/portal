import { Home, Trophy, Lock } from "lucide-react";

export const Footer = () => {
  return (
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
  );
};
