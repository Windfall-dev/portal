import React from "react";

import Games from "@/components/Games";
import Nextaction from "@/components/Nextaction";
import Ranker from "@/components/Ranker";
import TopKv from "@/components/TopKv";

export default async function Page() {
  return (
    <main className="mx-auto w-screen max-w-[430px] flex-grow overflow-y-auto overflow-x-hidden">
      <TopKv />
      <Games />
      <Ranker />
      <Nextaction />
    </main>
  );
}
