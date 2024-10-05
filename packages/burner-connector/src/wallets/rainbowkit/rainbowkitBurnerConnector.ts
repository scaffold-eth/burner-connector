import type { WalletDetailsParams } from "@rainbow-me/rainbowkit";
import { createConnector } from "@wagmi/core";
import type { EIP1193RequestFn, Transport, WalletRpcSchema } from "viem";
import { burner, type BurnerConnectorConfig } from "../../burnerConnector/burner.js";

type Provider = ReturnType<Transport<"custom", Record<any, any>, EIP1193RequestFn<WalletRpcSchema>>>;

export const rainbowkitBurnerConnector = (burnerConfig: BurnerConnectorConfig = {}) => (walletDetails: WalletDetailsParams) => {
  return createConnector<Provider>((config) => ({
    ...burner(burnerConfig)(config),
    ...walletDetails,
  }));
};
