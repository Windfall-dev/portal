"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

// import { WebGLGameWithAuth } from "@/components/WebGLGameWithAuth";

const CloseButton = () => {
  const pathname = useRouter();

  return (
    <div
      onClick={() => pathname.push("/game")}
      className="absolute top-16 right-4 z-10 rounded-full p-2 w-10 h-10"
      aria-label="Close"
    ></div>
  );
};
export default async function GamePlayPage() {
  // return <WebGLGameWithAuth url="/webgl/index.html" />;
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Image
        src="/_Game_play.png"
        fill={true}
        alt="Game play"
        objectFit="cover"
        className="object-top"
      />
      <CloseButton />
    </div>
  );
}
