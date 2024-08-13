import React from "react";

import Games from "@/components/Games";
import Nextaction from "@/components/Nextaction";
import Ranker from "@/components/Ranker";
import TopKv from "@/components/TopKv";

export default async function Page() {
  return (
    <main className="flex-grow overflow-y-auto">
      <TopKv />
      <Games />
      <Ranker />
      <Nextaction />
    </main>
  );
}
