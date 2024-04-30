"use client";

import {
  connectorsForWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { createConfig, WagmiProvider } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { createClient, http } from "viem";
import { rainbowkitBurnerWallet } from "@scaffold-eth/burner-connector";

const wallets = [metaMaskWallet, rainbowkitBurnerWallet];
const walletConnectProjectID = "3a8170812b534d0ff9d794f19a901d64";
const wagmiConnectors = connectorsForWallets(
  [
    {
      groupName: "Supported Wallets",
      wallets,
    },
  ],

  {
    appName: "scaffold-eth-2",
    projectId: walletConnectProjectID,
  },
);

const chains = [mainnet, polygon, optimism, arbitrum, base] as const;

const wagmiConfig = createConfig({
  chains: chains,
  connectors: wagmiConnectors,
  ssr: true,
  client({ chain }) {
    return createClient({ chain, transport: http() });
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const ScaffoldEthAppWithProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
