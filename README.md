# Onchain Game Development Starter Kit

This repository provides a comprehensive starter kit for developers familiar with web2 technologies who want to build onchain games. It combines the power of modern web development tools with blockchain integration, offering a seamless experience for creating decentralized gaming applications.

## High-Level Architecture

This starter kit is built on the [T3 Stack](https://create.t3.gg/), which provides a robust foundation for full-stack, typesafe web development. The architecture consists of:

1. **Frontend**: Next.js with React, styled using Tailwind CSS and DaisyUI
2. **API Layer**: tRPC for type-safe API endpoints
3. **Web2 Backend**: PostgreSQL database with Prisma ORM
4. **Onchain Backend**: Connection to the Base Sepolia testnet (EVM-compatible blockchain) with Viem and Wagmi
5. **Authentication**: NextAuth.js with Sign In With Ethereum (SIWE) support
6. **Smart Contract Development**: Solidity contracts with testing setup using Hardhat or Foundry

## Technology Deep Dive

### Next.js and T3 Stack

The application is built using [Next.js](https://nextjs.org/), a powerful React framework for building web applications. The T3 Stack adds additional tools:

- **TypeScript**: Used throughout the app for type safety
- **tRPC**: Enables the creation of type-safe API endpoints
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development

### Web2 Backend

- **PostgreSQL**: An open-source relational database
- **Prisma**: An ORM that provides type-safe database queries and model definitions
- **tRPC Procedures**: Used to interact with the database, ensuring type safety from the database to the frontend

### Onchain Connections

- **Base Sepolia**: The default testnet for this starter kit (easily configurable to other EVM-compatible networks)
- **OnchainKit**: A library for frontend blockchain interactions, including wallet connection and Coinbase Smart Wallet integration
- **Viem and Wagmi**: Libraries for interacting with the blockchain that come backed with OnchainKit

### Authentication

- **NextAuth**: Handles user authentication
- **Sign In With Ethereum (SIWE)**: Allows users to authenticate using their crypto wallets
- **Session Management**: Enables secure, wallet-based authentication for backend requests

### Frontend

- **React**: A popular library for building user interfaces
- **Tailwind CSS**: Used for styling components
- **DaisyUI**: A component library built on top of Tailwind, providing ready-to-use UI components and theming capabilities

### Smart Contract Development

- **Solidity**: The programming language for writing smart contracts
- **Testing Environment**: Pre-configured setup for testing smart contracts before deployment
- **Template**: Uses [pcaversaccio's solidity template](https://github.com/pcaversaccio/hardhat-project-template-ts) (see /solidity/README.md for more)

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```
   bun install
   ```
3. Start the local PostgreSQL database (using Docker):
   ```
   ./start-database.sh
   ```
4. Push the Prisma schema to the database:
   ```
   bun run db:push
   ```
5. Start the development server:
   ```
   bun run dev
   ```

## Smart Contract Development

Refer to the README in the `/solidity` folder for instructions on writing, testing, and deploying smart contracts.

## Learn More

- [T3 Stack Documentation](https://create.t3.gg/)
- [Next.js Documentation](https://nextjs.org/docs)
- [OnchainKit Documentation](https://onchainkit.xyz/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [DaisyUI Documentation](https://daisyui.com/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Wordle Example

In this repo example the game is Wordle. Users have 6 guesses to guess the 5 letter word. Winners are recorded onchain.

Here is a breakdown of how the repo is used to make the game work:

- **Connect Wallet With OnchainKit**: Users must connect their wallet. Think of this as a universal identity that is used across many onchain apps. Users can bring their identity with them. You can inspect their connected address to learn more about the users who are playing your game.
- **NextAuth & Sign In With Ethereum**: Users sign a message to prove that they own the wallet that they have connected with. Until this step is complete, you cannot be certain if the connected wallet address is being spoofed or not. When a users signs a message and sends it to your backend, only then can you be certain that the owner of the wallet is connecting to your app. This repo creates a session with NextAuth and creates a user record in the web2 database for this wallet address if it does not already exist. Subsequent requests will have this user in the session that can be inspected before executing any game logic.
- **Web2 Database vs Blockchain**: The blockchain is public and so any data that is written there is readable by anyone. In the Wordle game, we do not want the user to know the answer to the puzzle and so we store it in the web2 (private) database. When the user submits a guess, we can be confident that they are truly guessing the word and we compare their guess to the private word that we store in the web2 database. You may have data for your game that you do not want users to access. This pattern will keep data a secret from the user. When a user wins, we want to make that information public and usable by other onchain apps. We write the winners information to the blockchain using viem. Due to the way the smart contract was written, only our admin wallet can store data in the smart contract. Other apps can feel confident knowing that if the data exists in the smart contract, it was our app that wrote the data.