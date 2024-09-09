import { type Address } from "viem";
import { base, baseSepolia, type Chain } from "wagmi/chains";

export const APP_NAME = "Game Starter Template";
export const APP_DESCRIPTION = "Create an Onchain Game!";
export const APP_URL = "https://yourgame.com";
export const SUPPORTED_CHAINS: readonly [Chain, ...Chain[]] = [base, baseSepolia];
export const DEFAULT_CHAIN = SUPPORTED_CHAINS[0];
export const EAS_SCHEMA_ID = "0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9";

export const WINNER_CONTRACT: Address = "0x694a672253BD40cdC02e28c64C27Dd0c04c38814";