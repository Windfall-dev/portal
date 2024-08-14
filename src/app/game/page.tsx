import Image from "next/image";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";

const GamePage: React.FC = () => (
  <main className="mx-auto bg-transparent">
    <div className="relative max-h-[420px] aspect-square overflow-hidden">
      <Image
        src="/game_thumb_sample1.png"
        fill={true}
        alt="Game Thumb"
        objectFit="contain"
        className="scale-[1.12]"
      />
    </div>
    <div className="relative top-[-70px] pb-20">
      <div className="flex flex-col items-center">
        <div className="flex justify-center bg-gradient-to-t from-white to-white/0 w-full">
          <Image
            src="/game_icon.png"
            height={120}
            width={120}
            alt="game icon"
            className="rounded-xl"
          />
        </div>
        <div className="text-center px-5 py-4">
          <p className="text-body-bold text-muted-foreground">Puzzle</p>
          <h3>Game Title ABCDE</h3>
          <p className="body text-muted-foreground">
            Game Description abcd efghijk. Game Description abcd efghijk.Game
            Description.
          </p>
        </div>
        <Link href="../../game/play">
          <Button size="L" className="px-[30px] w-[315px] rounded-xl">
            <h2>PLAY</h2>
          </Button>
        </Link>
      </div>
    </div>
  </main>
);

export default GamePage;
