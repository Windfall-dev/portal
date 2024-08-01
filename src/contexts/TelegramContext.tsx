import { createContext } from "react";

interface TelegramContextProps {
  isLoading: boolean;
  initData: string;
}

export const TelegramContext = createContext<TelegramContextProps | undefined>(
  undefined,
);
