import Image from "next/image";
import React from "react";

import { InfoSingle } from "./Info";

function TopKv() {
  return (
    <div className="relative h-80 z-0 px-[30px] pt-10">
      <div className="flex flex-col h-full justify-between relative z-10 pb-6">
        <div className="w-[220px] space-y-[10px]">
          <h2>
            Catch copy <br /> ABCD12345
          </h2>
          <p className="body_bold text-muted-foreground">
            Sub copy ABCDE12345 ABCDE12345ABCDE12345
          </p>
        </div>
        <InfoSingle />
      </div>
      <Image
        src="/top_kv_sp.png"
        fill={true}
        alt="Top Image"
        className="absolute top-0 left-0 z-1"
      />
    </div>
  );
}

export default TopKv;
