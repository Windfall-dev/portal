import { Game } from "@/types/game";

export interface GameModalProps {
  game: Game;
  onClose: () => void;
  onStart: () => void;
}

export const GameModal: React.FC<GameModalProps> = ({
  game,
  onClose,
  onStart,
}) => (
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
