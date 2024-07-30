import { createContext } from "react";

interface TelegramContextProps {
  isLoaded: boolean;
  tgWebApp: TelegramWebApp | null;
}

export const TelegramContext = createContext<TelegramContextProps | undefined>(
  undefined,
);
