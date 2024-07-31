import { createContext } from "react";

interface TelegramContextProps {
  isLoading: boolean;
  isSignedIn: boolean;
  tgWebApp?: TelegramWebApp;
}

export const TelegramContext = createContext<TelegramContextProps | undefined>(
  undefined,
);
