import Image from "next/image";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";

function InfoSingle() {
  return (
    <div className="rounded-lg border-2 border-wf-yellow bg-white bg-opacity-80 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between pb-1">
        <div className="text-body-title text-wf-red">Prize Pool</div>
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

interface InfoDoubleProps {
  text1a: string;
  text1b: string;
  image1: string;
  alt1: string;
  text2a: string;
  text2b: string;
  image2: string;
  alt2: string;
}

/**
 * Has been made reusable by accepting props
 */
function InfoDouble({
  text1a,
  text1b,
  image1,
  alt1,
  text2a,
  text2b,
  image2,
  alt2,
}: InfoDoubleProps) {
  return (
    <div className="rounded-lg border-2 border-wf-yellow">
      <div className="bg-white bg-opacity-80 shadow-sm">
        <div className="flex items-center justify-between space-y-[6px] px-4 pb-1 pt-3">
          <div className="text-body-title text-wf-red">{text1a}</div>
        </div>
        <div className="flex items-center space-x-1 px-4 pb-3">
          <Image src={image1} width={32} height={32} alt={alt1} />
          <h1>{text1b}</h1>
        </div>
      </div>
      <div className="mx-4 border-t-2 border-wf-yellow"></div>
      <div className="bg-white bg-opacity-80 shadow-sm">
        <div className="flex items-center justify-between space-y-[6px] px-4 pb-1 pt-3">
          <div className="text-body-title text-wf-red">{text2a}</div>
        </div>
        <div className="flex items-center space-x-1 px-4 pb-3">
          <Image src={image2} width={24} height={24} alt={alt2} />
          <h2>{text2b}</h2>
        </div>
      </div>{" "}
    </div>
  );
}

export { InfoSingle, InfoDouble };
