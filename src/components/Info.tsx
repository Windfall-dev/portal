import Image from "next/image";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";

function InfoSingle() {
  return (
    <div className="rounded-lg border-2 border-wf-yellow bg-white bg-opacity-80 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between pb-1">
        <div className="text-body-title text-wf-red">Total Value Locked</div>
        <Link href="/staking">
          <Button size="S">
            <p className="text-body2_bold">STAKING &gt;</p>
          </Button>
        </Link>
      </div>
      <div className="flex items-center space-x-1">
        <Image src="/icon_dollar.png" width={32} height={32} alt="Dollar" />
        <h1>10,000,000</h1>
      </div>
    </div>
  );
}
function InfoDouble() {
  return (
    <div className="px-5">
      <div className="rounded-lg border-2 border-wf-yellow">
        <div className="bg-white bg-opacity-80 shadow-sm">
          <div className="flex items-center justify-between space-y-[6px] px-4 pb-1 pt-3">
            <div className="text-wf-red">Total Value Locked</div>
          </div>
          <div className="flex items-center space-x-1 px-4 pb-3">
            <Image src="/icon_dollar.png" width={32} height={32} alt="Dollar" />
            <h1>10,000,000</h1>
          </div>
        </div>
        <div className="bg-white bg-opacity-80 shadow-sm">
          <div className="flex items-center justify-between space-y-[6px] px-4 pb-1 pt-3">
            <div className="text-wf-red">Prize Pool</div>
          </div>
          <div className="flex items-center space-x-1 px-4 pb-3">
            <Image src="/icon_dollar.png" width={24} height={24} alt="Dollar" />
            <h2>50,000,000</h2>
          </div>
        </div>{" "}
      </div>
    </div>
  );
}

export { InfoSingle, InfoDouble };
