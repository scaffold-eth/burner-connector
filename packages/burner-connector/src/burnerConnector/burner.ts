import { createConnector, normalizeChainId, type SignTypedDataParameters } from "@wagmi/core";
import type { EIP1193RequestFn, Hex, SendTransactionParameters, Transport, WalletRpcSchema } from "viem";
import {
  http,
  BaseError,
  RpcRequestError,
  SwitchChainError,
  createWalletClient,
  custom,
  fromHex,
  getAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getHttpRpcClient, hexToBigInt, hexToNumber, numberToHex } from "viem/utils";
import { defaultBurnerId, defaultBurnerName, loadBurnerPK } from "../utils/index.js";

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

type Provider = ReturnType<Transport<"custom", Record<any, any>, EIP1193RequestFn<WalletRpcSchema>>>;

export type BurnerConnectorConfig = {
  id?: string;
  name?: string;
  storageKey?: string;
};

const defaultBurnerStorageKey = "burnerWallet.pk";

export const burner = (burnerConfig: BurnerConnectorConfig = {}) => {
  let connected = true;
  let connectedChainId: number;

  const storageKey = burnerConfig.storageKey ?? burnerConfig.id + ".pk" ?? defaultBurnerStorageKey;
  return createConnector<Provider>((config) => ({
    id: burnerConfig.id ?? defaultBurnerId,
    name: burnerConfig.name ?? defaultBurnerName,
    type: burnerConfig.id ?? defaultBurnerId,
    async connect({ chainId } = {}) {
      const provider = await this.getProvider();
      const accounts = await provider.request({
        method: "eth_accounts",
      });
      let currentChainId = await this.getChainId();
      if (chainId && currentChainId !== chainId && this.switchChain) {
        const chain = await this.switchChain({ chainId });
        currentChainId = chain.id;
      }
      connected = true;
      return { accounts, chainId: currentChainId };
    },
    async getProvider({ chainId } = {}) {
      const chain = config.chains.find((x) => x.id === chainId) ?? config.chains[0];

      const url = chain.rpcUrls.default.http[0];
      if (!url) throw new Error("No rpc url found for chain");
      const burnerAccount = privateKeyToAccount(loadBurnerPK(burnerConfig.storageKey ?? storageKey));
      const client = createWalletClient({
        chain: chain,
        account: burnerAccount,
        transport: http(),
      });

      const request: EIP1193RequestFn = async ({ method, params }) => {
        if (method === "eth_sendTransaction") {
          const actualParams = (params as SendTransactionParameters[])[0];
          const hash = await client.sendTransaction({
            account: burnerAccount,
            data: actualParams?.data,
            to: actualParams?.to,
            value: actualParams?.value ? hexToBigInt(actualParams.value as unknown as Hex) : undefined,
            gas: actualParams?.gas ? hexToBigInt(actualParams.gas as unknown as Hex) : undefined,
            nonce: actualParams?.nonce ? hexToNumber(actualParams.nonce as unknown as Hex) : undefined,
            maxPriorityFeePerGas: actualParams?.maxPriorityFeePerGas
              ? hexToBigInt(actualParams.maxPriorityFeePerGas as unknown as Hex)
              : undefined,
            maxFeePerGas: actualParams?.maxFeePerGas
              ? hexToBigInt(actualParams.maxFeePerGas as unknown as Hex)
              : undefined,
            gasPrice: (actualParams?.gasPrice
              ? hexToBigInt(actualParams.gasPrice as unknown as Hex)
              : undefined) as undefined,
          });
          return hash;
        }

        if (method === "personal_sign") {
          // first param is Hex data representation of message,
          // second param is address of the signer
          const rawMessage = (params as [`0x${string}`, `0x${string}`])[0];
          const signature = await client.signMessage({
            account: burnerAccount,
            message: { raw: rawMessage },
          });
          return signature;
        }

        if (method === "eth_signTypedData_v4") {
          // first param is address of the signer
          // second param is stringified typed data
          const stringifiedData = (params as [`0x${string}`, string])[1];
          const signature = await client.signTypedData(JSON.parse(stringifiedData) as SignTypedDataParameters);

          return signature;
        }

        if (method === "eth_accounts") {
          return [burnerAccount.address];
        }

        if (method === "wallet_switchEthereumChain") {
          type Params = [{ chainId: Hex }];
          connectedChainId = fromHex((params as Params)[0].chainId, "number");
          this.onChainChanged(connectedChainId.toString());
          return;
        }

        const body = { method, params };
        const httpClient = getHttpRpcClient(url);
        const { error, result } = await httpClient.request({ body });
        if (error) throw new RpcRequestError({ body, error, url });

        return result;
      };

      return custom({ request })({ retryCount: 0 });
    },
    onChainChanged(chain) {
      const chainId = normalizeChainId(chain);
      config.emitter.emit("change", { chainId });
    },
    async getAccounts() {
      if (!connected) throw new ConnectorNotConnectedError();
      const provider = await this.getProvider();
      const accounts = await provider.request({ method: "eth_accounts" });
      const burnerAddress = accounts.map((x) => getAddress(x))[0] as `0x${string}`;
      return [burnerAddress];
    },
    async onDisconnect() {
      config.emitter.emit("disconnect");
      connected = false;
    },
    async getChainId() {
      const provider = await this.getProvider();
      const hexChainId = await provider.request({ method: "eth_chainId" });
      return fromHex(hexChainId, "number");
    },
    async isAuthorized() {
      if (!connected) return false;
      const accounts = await this.getAccounts();
      return !!accounts.length;
    },
    onAccountsChanged(accounts) {
      if (accounts.length === 0) this.onDisconnect();
      else
        config.emitter.emit("change", {
          accounts: accounts.map((x) => getAddress(x)),
        });
    },
    async switchChain({ chainId }) {
      const provider = await this.getProvider();
      const chain = config.chains.find((x) => x.id === chainId);
      if (!chain) throw new SwitchChainError(new ChainNotConfiguredError());

      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: numberToHex(chainId) }],
      });
      return chain;
    },
    disconnect() {
      console.log("disconnect from burnerwallet");
      connected = false;
      return Promise.resolve();
    },
  }));
};
