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