import Image from "next/image";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";

// import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import games from "../app/mock_games.json";
import SectionTitle from "./SectionTitle";

function Games() {
  return (
    <div className="py-5">
      <SectionTitle title="GAMES" />
      <div className="hidden-scrollbar flex space-x-2 overflow-x-auto px-5">
        {games.map((game, index) => (
          <GameCard
            key={index}
            imagePath={game.imagePath}
            gameTitle={game.gameTitle}
            caption={game.caption}
            gameUrl={game.gameUrl}
            isPlayable={game.isPlayable}
          />
        ))}
      </div>
      {/* <ScrollBar orientation="horizontal" /> */}
    </div>
  );
}
interface GameCardProps {
  imagePath: string;
  gameTitle: string;
  caption: string;
  gameUrl: string;
  isPlayable: boolean;
}

function GameCard({
  imagePath,
  gameTitle,
  caption,
  isPlayable,
}: GameCardProps) {
  return (
    <Link
      href={isPlayable ? "/game" : ""}
      className="w-40 flex-shrink-0 space-y-3"
    >
      <div className="relative h-[120px]">
        <Image
          src={imagePath}
          alt="Game Thumbnail"
          fill={true}
          style={{ objectFit: "cover" }}
          className="rounded-md"
        />
      </div>
      <div className="flex flex-col space-y-3">
        <div>
          <p className="text-body-title h-[22px]">{gameTitle}</p>
          <p className="text-caption">{caption}</p>
        </div>
        {isPlayable ? (
          <Button className="w-full">PLAY</Button>
        ) : (
          <Button className="w-full" variant="disabled" disabled>
            Coming Soon
          </Button>
        )}
      </div>
    </Link>
  );
}

export default Games;
