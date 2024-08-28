"use client";

import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/hooks/useAuth";

export function WebGLGameWithAuth({ url }: { url: string }) {
  const { accessToken } = useAuth();

  const ref = useRef<HTMLIFrameElement>(null);
  const [requestOrigin, setRequestOrigin] = useState<string>("");

  useEffect(() => {
    const handleTokenRequest = (event: MessageEvent) => {
      if (
        event.data.type === "RequestToken" &&
        ref.current &&
        ref.current.contentWindow
      ) {
        setRequestOrigin(event.origin);
      }
    };
    window.addEventListener("message", handleTokenRequest);
    return () => {
      window.removeEventListener("message", handleTokenRequest);
    };
  }, []);

  useEffect(() => {
    if (requestOrigin && ref.current && ref.current.contentWindow) {
      ref.current.contentWindow.postMessage(
        { type: "SendToken", token: accessToken },
        requestOrigin,
      );
    }
  }, [requestOrigin, accessToken]);

  return (
    <iframe ref={ref} src={url} className="h-screen w-full bg-black"></iframe>
  );
}
