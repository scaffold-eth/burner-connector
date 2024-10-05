import type { Hex } from "viem";
import { generatePrivateKey } from "viem/accounts";

export const defaultBurnerId = "burnerWallet" as const;
export const defaultBurnerName = "Burner Wallet" as const;

/**
 * Checks if the private key is valid
 */
const isValidPK = (pk: Hex | string | undefined | null): boolean => {
  return pk?.length === 64 || pk?.length === 66;
};

/**
 * Save the current burner private key to local storage
 */
export const saveBurnerPK = (privateKey: Hex, storageKey: string): void => {
  if (typeof window !== "undefined" && window != null) {
    window?.localStorage?.setItem(storageKey, privateKey);
  }
};

/**
 * Gets the current burner private key from local storage
 */
export const loadBurnerPK = (storageKey: string): Hex => {
  let currentSk: Hex = "0x";
  if (typeof window !== "undefined" && window != null) {
    currentSk = (window?.localStorage?.getItem?.(storageKey)?.replaceAll('"', "") ?? "0x") as Hex;
  }

  if (!!currentSk && isValidPK(currentSk)) {
    return currentSk;
  }
  // If no burner is found in localstorage, we will generate a random private key
  const newDefaultPrivateKey = generatePrivateKey();
  saveBurnerPK(newDefaultPrivateKey, storageKey);
  return newDefaultPrivateKey;
};
