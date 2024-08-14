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
      <div className="flex px-5 space-x-2 overflow-x-auto hidden-scrollbar">
        {games.map((game, index) => (
          <GameCard
            key={index}
            imagePath={game.imagePath}
            gameTitle={game.gameTitle}
            caption={game.caption}
            gameUrl={game.gameUrl}
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
}

function GameCard({ imagePath, gameTitle, caption, gameUrl }: GameCardProps) {
  return (
    <Link href="/game" className="w-40 space-y-3 flex-shrink-0">
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
        <Link href={gameUrl}>
          <Button className="w-full">PLAY</Button>
        </Link>
      </div>
    </Link>
  );
}

export default Games;
