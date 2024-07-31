import { stringify } from "querystring";
import { useEffect, useRef, useState } from "react";

import { TelegramContext } from "@/contexts/TelegramContext";

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [tgWebApp, setTgWebApp] = useState<TelegramWebApp | null>(null);

  useEffect(() => {
    (async () => {
      if (!initialized.current) {
        initialized.current = true;
        if (window.Telegram?.WebApp) {
          const tgWebApp = window.Telegram.WebApp;
          tgWebApp.ready();
          const initData =
            "user=%7B%22id%22%3A596533929%2C%22first_name%22%3A%22Taiju%22%2C%22last_name%22%3A%22Sanagi%22%2C%22username%22%3A%22taijusanagi%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%7D&chat_instance=-9202674396613559208&chat_type=private&auth_date=1722392031&hash=e817b073b8cf82eac5560ddbde00ecf8c3d4ad6989ba9d77b74c898e32860b80";
          if (initData) {
            const csrfApiResponse = await fetch("api/auth/csrf");
            const { csrfToken } = await csrfApiResponse.json();
            const res = await fetch(`api/auth/callback/credentials?`, {
              headers: {
                "content-type": "application/x-www-form-urlencoded",
              },
              body: stringify({
                initData,
                csrfToken,
              }),
              method: "POST",
            });
            if (res.ok) {
              setTgWebApp(tgWebApp);
              setIsSignedIn(true);
            }
          }
        }
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <TelegramContext.Provider value={{ isLoading, isSignedIn, tgWebApp }}>
      {children}
    </TelegramContext.Provider>
  );
}
