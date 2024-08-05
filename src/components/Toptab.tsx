import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import Link from "next/link";
import React from "react";

function Toptab() {
  return (
    <Tabs
      defaultValue="Staking"
      className="flex justify-center items-center bg-white h-10 border-y border-border"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="staking">
          <div className="flex flex-row items-center w-full border-r-2 border-border h-5 justify-center">
            <img src="/icon_staking.png" alt="Staking" className="h-5 w-5" />
            <div className="m-[6px] body2-bold">Staking</div>{" "}
          </div>
        </TabsTrigger>
        <TabsTrigger value="game">
          <Link
            href="/game"
            className="flex-1 flex items-center justify-center"
          >
            <div className="flex flex-row items-center w-full h-5 justify-center">
              <img src="/icon_game.png" alt="Game" className="h-5 w-5" />
              <div className="m-[6px] body2-bold">GAMES</div>
            </div>
          </Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export default Toptab;
