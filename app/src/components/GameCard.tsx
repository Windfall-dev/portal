import { Game } from "@/types/game";

export interface GameCardProps {
  game: Game;
  onClick: (game: Game) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onClick }) => (
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
