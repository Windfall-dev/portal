import { createContext } from "react";

interface TelegramContextProps {
  tgWebApp: TelegramWebApp | null;
}

export const TelegramContext = createContext<TelegramContextProps | undefined>(
  undefined,
);
