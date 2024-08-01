import { createContext } from "react";

interface TelegramContextProps {
  isLoading: boolean;
  isEnabled: boolean;
}

export const TelegramContext = createContext<TelegramContextProps | undefined>(
  undefined,
);
