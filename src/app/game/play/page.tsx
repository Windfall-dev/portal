import React from "react";

import { WebGLGameWithAuth } from "@/components/WebGLGameWithAuth";

import GamePlayLayout from "./layout";

export default async function GamePlayPage() {
  return (
    <GamePlayLayout>
      <WebGLGameWithAuth url="/game-only-logic/index.html" />;
    </GamePlayLayout>
  );
}
