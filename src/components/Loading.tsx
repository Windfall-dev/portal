import Image from "next/image";
import React from "react";

function Loading() {
  return (
    <div className="flex w-[100px] flex-col items-center space-y-2 rounded-xl bg-black/[0.5] p-5">
      <Image src="/loading_windfall.gif" alt="loading" width={60} height={60} />
      <p className="text-body-bold text-white">Loading</p>
    </div>
  );
}

export default Loading;
