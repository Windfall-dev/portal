import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

function Toptab() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("/");

  useEffect(() => {
    if (pathname.includes("/staking")) {
      setActiveTab("staking");
    } else if (pathname.includes("/game")) {
      setActiveTab("game");
    } else {
      setActiveTab("/");
    }
    console.log(pathname);
  }, [pathname]);

  return (
    <Tabs
      value={activeTab}
      className="flex h-10 items-center justify-center border-y border-border bg-white"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger
          value="staking"
          className="data-[state=active]:text-wf-orange"
        >
          <Link href="/staking">
            <div className="flex h-5 w-full flex-row items-center justify-center border-r-2 border-border">
              <Image
                src={
                  activeTab === "staking"
                    ? "icon_staking_orange.svg"
                    : "/icon_staking.svg"
                }
                alt="Staking"
                height={20}
                width={20}
              />
              <div className="text-body2_bold m-[6px]">Deposit</div>{" "}
            </div>
          </Link>
        </TabsTrigger>
        <TabsTrigger
          value="game"
          className="data-[state=active]:text-wf-orange"
        >
          <Link
            href="/game"
            className="flex flex-1 items-center justify-center"
          >
            <div className="flex h-5 w-full flex-row items-center justify-center">
              <Image
                src={
                  activeTab === "game"
                    ? "icon_game_orange.svg"
                    : "/icon_game.svg"
                }
                alt="Staking"
                height={20}
                width={20}
              />
              <div className="text-body2_bold m-[6px]">GAMES</div>
            </div>
          </Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export default Toptab;
