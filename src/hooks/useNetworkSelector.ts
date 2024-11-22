import { createContext, useContext } from "react";

interface NetworkSelectorContextType {
  handleNetworkChange: (networkValue: string) => void;
  currentEndpoint: string;
}

export const NetworkSelectorContext =
  createContext<NetworkSelectorContextType | null>(null);

export function useNetworkSelector() {
  const context = useContext(NetworkSelectorContext);
  if (!context) {
    throw new Error(
      "useNetworkSelector must be used within a NetworkSelectorProvider",
    );
  }
  return context;
}
