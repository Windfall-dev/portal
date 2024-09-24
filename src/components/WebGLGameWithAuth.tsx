"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/hooks/useAuth";

export function WebGLGameWithAuth({ url }: { url: string }) {
  const { accessToken, userId } = useAuth();

  const router = useRouter();

  const ref = useRef<HTMLIFrameElement>(null);
  const [requestOrigin, setRequestOrigin] = useState<string>("");
  const apiUrl = process.env.NEXT_PUBLIC_FAST_API_URL;

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
    const handleGoHomeRequest = (event: MessageEvent) => {
      if (event.data.type === "goToHome") {
        console.log("completed");
        router.push("/");
      }
    };
    window.addEventListener("message", handleTokenRequest);
    window.addEventListener("message", handleGoHomeRequest);
    return () => {
      window.removeEventListener("message", handleTokenRequest);
      window.removeEventListener("message", handleGoHomeRequest);
    };
  }, []);

  useEffect(() => {
    if (requestOrigin && ref.current && ref.current.contentWindow) {
      ref.current.contentWindow.postMessage(
        {
          type: "SendToken",
          token: accessToken,
          apiUrl: apiUrl,
          userId: userId,
        },
        requestOrigin,
      );
    }
  }, [requestOrigin, accessToken, apiUrl, userId]);

  return (
    <iframe ref={ref} src={url} className="h-screen w-full bg-black"></iframe>
  );
}
