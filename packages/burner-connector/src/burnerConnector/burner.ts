import { createConnector, normalizeChainId } from "wagmi";
import type {
  EIP1193RequestFn,
  Hex,
  SendTransactionParameters,
  Transport,
  WalletRpcSchema,
  SignTypedDataParameters,
} from "viem";
import {
  http,
  BaseError,
  RpcRequestError,
  SwitchChainError,
  createWalletClient,
  custom,
  fromHex,
  getAddress,
  createPublicClient,
  slice,
  concat,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getHttpRpcClient, hexToBigInt, hexToNumber, numberToHex } from "viem/utils";
import { burnerWalletId, burnerWalletName, loadBurnerPK } from "../utils/index.js";

const GAS_MULTIPLIER = 110n; // 10% more gas
// Magic identifier for burner wallet
const BURNER_MAGIC_IDENTIFIER = "0x424E524E52424E52424E52424E52424E52424E52424E52424E52424E52424E52"; // "BNRNRBNRNRBNRNRBNRNRBNRNRBNRNRBNRNRBNRNRBNRNRBNRNRBNRNRNR"

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

type BurnerConfig = {
  useSessionStorage?: boolean;
  rpcUrls?: Record<number, string>;
};

export const burner = ({ useSessionStorage = false, rpcUrls = {} }: BurnerConfig = {}) => {
  let connected = true;
  let connectedChainId: number;
  return createConnector<Provider>((config) => ({
    id: burnerWalletId,
    name: burnerWalletName,
    type: burnerWalletId,
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
      const targetChainId = chainId || connectedChainId;
      const chain = config.chains.find((x) => x.id === targetChainId) ?? config.chains[0];
      // Use custom RPC URL if provided, otherwise fallback to default
      const url = rpcUrls[chain.id] || chain.rpcUrls.default.http[0];
      if (!url) throw new Error("No rpc url found for chain");

      const burnerAccount = privateKeyToAccount(loadBurnerPK({ useSessionStorage }));
      const client = createWalletClient({
        chain: chain,
        account: burnerAccount,
        transport: http(url),
      });
      const publicClient = createPublicClient({
        chain: chain,
        transport: http(url),
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

        if (method === "wallet_getCapabilities") {
          // Accept params as [address, chainIds?]
          const chainIdsRaw = (params as [string, string[]?])[1] as string[] | undefined;
          // Get supported chains from config
          const supportedChains = config.chains.map((chain) => numberToHex(chain.id));
          // If no chainIds provided, use all supported
          const chainIds = chainIdsRaw && chainIdsRaw.length > 0 ? chainIdsRaw : supportedChains;
          const capabilities: Record<string, any> = {};
          for (const chainId of chainIds) {
            capabilities[chainId] = {
              atomic: { status: "unsupported" },
            };
          }
          return capabilities;
        }

        if (method === "wallet_sendCalls") {
          // Define the type for params
          type WalletSendCallsParams = {
            version: string;
            chainId: string;
            from: string;
            calls: Array<{
              to: string;
              data: string;
              value: string;
            }>;
            atomicRequired: boolean;
          };
          const sendCallsParams = (params as [WalletSendCallsParams])[0];

          if (sendCallsParams.atomicRequired) {
            throw new Error("Atomic execution not supported");
          }

          // Execute calls sequentially for now
          const requests = [];
          let nonceIncrement = 0;
          for (const call of sendCallsParams.calls) {
            const request = await client.prepareTransactionRequest({
              account: burnerAccount,
              data: call.data as `0x${string}`,
              to: call.to as `0x${string}`,
              value: call.value ? hexToBigInt(call.value as `0x${string}`) : undefined,
            });
            requests.push({
              ...request,
              gas: (request.gas * GAS_MULTIPLIER) / 100n,
              nonce: request.nonce + nonceIncrement,
            });
            nonceIncrement++;
          }

          const hashes = await Promise.all(requests.map((request) => client.sendTransaction(request)));

          // Create a robust ID by concatenating transaction hashes, chain ID, and magic identifier
          const id = concat([
            ...hashes,
            numberToHex(Number(sendCallsParams.chainId), { size: 32 }),
            BURNER_MAGIC_IDENTIFIER,
          ]);

          return {
            id,
            capabilities: {
              atomic: false,
            },
          };
        }

        if (method === "wallet_getCallsStatus") {
          const [id] = params as [string];

          // Check if the ID ends with our magic identifier
          const isTransactions = id.endsWith(BURNER_MAGIC_IDENTIFIER.slice(2));
          if (!isTransactions) {
            throw new Error("Invalid calls ID: missing or incorrect magic identifier");
          }

          // Extract chainId and hashes
          const chainId = fromHex(slice(id as `0x${string}`, -64, -32), "number");
          const hashesHex = (slice(id as `0x${string}`, 0, -64) as string).slice(2).match(/.{1,64}/g) || [];
          const hashes = hashesHex.map((hash: string) => `0x${hash}` as `0x${string}`);

          // Get receipts for all transactions
          const receipts = await Promise.all(
            hashes.map(async (hash: `0x${string}`) => {
              try {
                const receipt = await publicClient.getTransactionReceipt({ hash });
                return {
                  logs: receipt.logs,
                  status: receipt.status === "success" ? "0x1" : "0x0",
                  blockHash: receipt.blockHash,
                  blockNumber: numberToHex(receipt.blockNumber),
                  gasUsed: numberToHex(receipt.gasUsed),
                  transactionHash: receipt.transactionHash,
                };
              } catch (error) {
                // If we can't get the receipt, the transaction is still pending
                return null;
              }
            }),
          );

          // Determine status based on receipts
          const status = receipts.every((r) => r === null)
            ? 100 // All pending
            : receipts.some((r) => r === null)
              ? 600 // Some pending, some complete
              : receipts.every((r) => r?.status === "0x1")
                ? 200 // All successful
                : receipts.every((r) => r?.status === "0x0")
                  ? 500 // All failed
                  : 600; // Mixed results

          const result = {
            version: "1.0",
            chainId: numberToHex(chainId),
            id,
            status,
            atomic: false, // We always execute non-atomically
            receipts: receipts.filter((r): r is NonNullable<typeof r> => r !== null),
            capabilities: {
              atomic: {
                status: "unsupported",
              },
            },
          };

          return result;
        }

        if (method === "wallet_showCallsStatus") {
          // This is a UI method, we'll just return success
          return true;
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
