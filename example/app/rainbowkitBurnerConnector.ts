import { WalletDetailsParams } from "@rainbow-me/rainbowkit";
import { burner } from "burner-connector-test01";
import { EIP1193RequestFn, Transport, WalletRpcSchema } from "viem";
import { BaseError, createConnector } from "wagmi";

export const burnerWalletId = "burnerWallet";
export const burnerWalletName = "Burner Wallet";

export class ConnectorNotConnectedError extends BaseError {
	override name = "ConnectorNotConnectedError";
	constructor() {
		super("Connector not connected.");
	}
}

export class ChainNotConfiguredError extends BaseError {
	override name = "ChainNotConfiguredError";
	constructor() {
		super("Chain not configured.");
	}
}

type Provider = ReturnType<
	Transport<"custom", Record<any, any>, EIP1193RequestFn<WalletRpcSchema>>
>;

export const createBurnerConnector = (walletDetails: WalletDetailsParams) => {
	return createConnector<Provider>((config) => ({
		...burner()(config),
		...walletDetails,
	}));
};
