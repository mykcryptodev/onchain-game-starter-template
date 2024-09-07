import { base } from "wagmi/chains";

export const isBaseMainnet = ({ chainId }: { chainId: number }) => chainId === base.id;