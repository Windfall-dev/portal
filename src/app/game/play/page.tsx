import React from "react";

import { WebGLGameWithAuth } from "@/components/WebGLGameWithAuth";

export default async function GamePlayPage() {
  return <WebGLGameWithAuth url="/webgl/index.html" />;
}
