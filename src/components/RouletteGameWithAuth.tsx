import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/hooks/useAuth";

export function RouletteGameWithAuth() {
  const { accessToken, userId } = useAuth();
  const router = useRouter();
  const ref = useRef<HTMLIFrameElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        // トークンを送信
        ref.current.contentWindow.postMessage(
          {
            type: "SendToken",
            token: accessToken,
            apiUrl: apiUrl,
            userId: userId,
          },
          event.origin,
        );
      }
    };

    const handleGoHomeRequest = (event: MessageEvent) => {
      if (event.data.type === "goToHome") {
        router.push("/");
      }
    };

    window.addEventListener("message", handleTokenRequest);
    window.addEventListener("message", handleGoHomeRequest);

    return () => {
      window.removeEventListener("message", handleTokenRequest);
      window.removeEventListener("message", handleGoHomeRequest);
    };
  }, [accessToken, apiUrl, router, userId]);

  return (
    <iframe
      ref={ref}
      src="/roulette-game/index.html"
      className="h-screen w-full bg-[#0D1117]"
    />
  );
}
