import Image from "next/image";
import React from "react";

import { InfoSingle } from "./Info";

function TopKv() {
  return (
    <div className="relative z-0 h-80 px-[30px] pt-10">
      <div className="relative z-10 flex h-full flex-col justify-between pb-6">
        <div className="w-[220px] space-y-[10px]">
          <h2>
            Catch copy <br /> ABCD12345
          </h2>
          <p className="text-body-bold text-muted-foreground">
            Sub copy ABCDE12345 ABCDE12345ABCDE12345
          </p>
        </div>
        <InfoSingle />
      </div>
      <Image
        src="/top_kv_sp.png"
        fill={true}
        alt="Top Image"
        className="z-1 absolute left-0 top-0"
      />
    </div>
  );
}

export default TopKv;
