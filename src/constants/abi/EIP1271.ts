export const EIP1271_ABI = [
  {
    inputs: [
      { name: "_hash", type: "bytes32" },
      { name: "_signature", type: "bytes" }
    ],
    name: "isValidSignature",
    outputs: [{ name: "magicValue", type: "bytes4" }],
    stateMutability: "view",
    type: "function"
  }
] as const;