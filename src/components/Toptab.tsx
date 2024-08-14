import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
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
      className="flex justify-center items-center bg-white h-10 border-y border-border"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger
          value="staking"
          className="data-[state=active]:text-wf-orange"
        >
          <Link href="/staking">
            <div className="flex flex-row items-center w-full border-r-2 border-border h-5 justify-center">
              <img src="/icon_staking.png" alt="Staking" className="h-5 w-5" />
              <div className="m-[6px] text-body2_bold">Staking</div>{" "}
            </div>
          </Link>
        </TabsTrigger>
        <TabsTrigger
          value="game"
          className="data-[state=active]:text-wf-orange"
        >
          <Link
            href="/game"
            className="flex-1 flex items-center justify-center"
          >
            <div className="flex flex-row items-center w-full h-5 justify-center">
              <img src="/icon_game.png" alt="Game" className="h-5 w-5" />
              <div className="m-[6px] text-body2_bold">GAMES</div>
            </div>
          </Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export default Toptab;
