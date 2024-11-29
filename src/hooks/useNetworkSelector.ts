import { createContext, useContext } from "react";

import { DEFAULT_NETWORK, NETWORKS, NetworkConfig } from "@/lib/solana-wallet";

interface NetworkSelectorContextType {
  currentNetwork: NetworkConfig;
  setCurrentNetwork: (network: NetworkConfig) => void;
  networks: NetworkConfig[];
}

export const NetworkSelectorContext = createContext<NetworkSelectorContextType>(
  {
    currentNetwork: DEFAULT_NETWORK,
    setCurrentNetwork: () => {},
    networks: NETWORKS,
  },
);

export function useNetworkSelector() {
  const context = useContext(NetworkSelectorContext);
  if (!context) {
    throw new Error(
      "useNetworkSelector must be used within a NetworkSelectorProvider",
    );
  }
  return context;
}
