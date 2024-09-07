import { createConfig, getPublicClient,http } from "@wagmi/core";
import {type Address, isAddress, isAddressEqual,verifyMessage,zeroAddress } from 'viem'
import { base } from "wagmi/chains";

import { SUPPORTED_CHAINS } from "~/constants";

const verifySignature = async(
  message: string,
  signature: string,
  address: Address,
  chainId: number = base.id,
): Promise<boolean> => {
  // First, try standard EOA signature verification
  try {
    return await verifyMessage({
      message,
      address,
      signature: signature as `0x${string}`,
    });
  } catch (error) {
    console.warn("Not an EOA signature, trying EIP-1271...", error);
  }

  // If EOA verification fails, try EIP-1271 verification
  if (isAddress(address) && !isAddressEqual(address, zeroAddress)) {
    try {
      const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
      if (!chain) {
        throw new Error(`Chain ID ${chainId} not supported`);
      }
      const config = createConfig({ 
        chains: [chain], 
        transports: { 
          [chain.id]: http(),
        }, 
      });
      const client = getPublicClient(config);
      const isValid = await client?.verifyMessage({
        address, 
        message, 
        signature: signature as `0x${string}`,
      });
      return isValid ?? false;
    } catch (error) {
      console.error("EIP-1271 verification failed:", error)
    }
  }

  return false
}

export default verifySignature;