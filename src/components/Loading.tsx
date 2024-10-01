import Image from "next/image";
import React from "react";

function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex h-32 w-[100px] flex-col items-center rounded-xl bg-black bg-opacity-80 py-5">
        <Image
          src="/loading_windfall.gif"
          alt="Loading..."
          width={60}
          height={60}
        />
        <p className="mt-2 font-bold text-white">Loading...</p>
      </div>
    </div>
  );
}

export default Loading;
