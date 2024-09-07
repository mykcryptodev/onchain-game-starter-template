#!/bin/bash

# Directory of your Next.js project
NEXTJS_DIR=$(pwd)

# Directory for your Hardhat project
HARDHAT_DIR="${NEXTJS_DIR}/solidity"

# URL of the template repository
TEMPLATE_REPO="https://github.com/pcaversaccio/hardhat-project-template-ts.git"

# Create the solidity directory if it doesn't exist
mkdir -p $HARDHAT_DIR

# Clone the template repository
git clone $TEMPLATE_REPO $HARDHAT_DIR

# Remove the .git directory from the cloned repo
rm -rf "${HARDHAT_DIR}/.git"

# Navigate to the Hardhat directory
cd $HARDHAT_DIR

# Install dependencies
bun install

# Navigate back to the Next.js project root
cd $NEXTJS_DIR

# Add a script to package.json to run Hardhat commands
npm pkg set scripts.hardhat="cd solidity && npx hardhat"

echo "Hardhat project initialized successfully in the 'solidity' directory!"
echo "You can now run Hardhat commands using 'bun run hardhat <command>'"