# Subgraph Initialization Guide

This guide provides step-by-step instructions for initializing and deploying a subgraph in the Neura ecosystem.

## 🚀 Quick Start with CLI Tool (Recommended)

The fastest way to create a subgraph is using our automated CLI tool that generates all necessary files for you.

### Prerequisites

- **Node.js** (v18 or later)
- **Yarn or npm**
- **Git** for version control

### Using the CLI Generator

1. **Navigate to the project root:**

   ```bash
   cd /path/to/neura-ecosystem-subgraphs
   ```

2. **Run the CLI generator:**

   ```bash
   # Using yarn (recommended)
   yarn generate

   # Or using npm
   npm run generate

   # Or run directly with ts-node
   npx ts-node src/cli-generate/index.ts
   ```

3. **Follow the interactive prompts:**

   ```
   📝 App name: my-token (supports nested directories: org/project)
   🌐 Network name: neura
   🔗 RPC URL (press Enter for default: https://testnet.rpc.neuraprotocol.io):
   📋 Contract address: 0x1234567890123456789012345678901234567890

   🔍 Block Explorer API (optional - for fetching real ABI):
   Examples:
     Ethereum (Mainnet): https://api.etherscan.io/api
     Ethereum (Sepolia): https://api-sepolia.etherscan.io/api
     BSC (Mainnet): https://api.bscscan.com/api
     BSC (Testnet): https://api-testnet.bscscan.com/api
     Polygon: https://api.polygonscan.com/api
     Arbitrum: https://api.arbiscan.io/api
     Base: https://api.basescan.org/api
     Avalanche: https://api.snowtrace.io/api
     Neura (Testnet): https://testnet-blockscout.infra.neuraprotocol.io/api

   🌍 Block explorer API URL (press Enter for default: https://testnet-blockscout.infra.neuraprotocol.io/api): https://api.etherscan.io/api
   📍 Start block (press Enter for 0): 1000000

   🚀 Deploy node URL (press Enter for default: https://deploy-testnet-graph-neura.infra.neuraprotocol.io/):
   📦 IPFS URL (press Enter for default: https://ipfs-testnet-graph-neura.infra.neuraprotocol.io):
   ```

4. **The CLI will automatically:**

   - ✅ Verify your RPC connection
   - ✅ Fetch the contract ABI from the block explorer (if provided)
   - ✅ Configure deploy and IPFS endpoints for your subgraph
   - ✅ Create the directory structure in `subgraphs/your-app-name/`
   - ✅ Generate all necessary files:
     - `package.json` with correct dependencies and configured deploy scripts
     - `subgraph.yaml` with your contract configuration
     - `schema.graphql` with entity definitions based on events
     - `src/your-app-name.ts` with event handlers
     - `networks.json` with network configuration
     - `tsconfig.json` with proper settings
     - `abis/YourContract.json` with the contract ABI

5. **Navigate to your generated subgraph and install dependencies:**

   ```bash
   cd subgraphs/my-token
   yarn install
   ```

6. **Build and deploy:**

   ```bash
   # Generate TypeScript types from GraphQL schema and ABI
   yarn codegen

   # Build the subgraph
   yarn build

   # Deploy to testnet (automatically configured)
   yarn deploy
   ```

### CLI Features

- **🔄 Automatic ABI Fetching:** Fetches contract ABI directly from block explorers
- **✅ Input Validation:** Validates RPC URLs, contract addresses, and network connectivity
- **📁 Smart File Generation:** Creates all necessary files with proper configurations
- **🎯 Event-Based Schema:** Automatically generates GraphQL schema based on contract events
- **🌐 Multi-Network Support:** Works with Ethereum, BSC, Polygon, Avalanche, Arbitrum, Base, Optimism, Neura, and custom networks
- **⚡ Zero Configuration:** No manual file editing required
- **🏠 Smart Defaults:** Uses Neura testnet RPC, block explorer, and deploy endpoints as defaults
- **🚀 Configurable Deploy Endpoints:** Customize Graph Node and IPFS URLs for different environments
- **📂 Nested Directory Support:** Use forward slashes in app names to create organized directory structures

### Supported Block Explorers

The CLI can automatically fetch ABIs from these block explorers:

- **Ethereum Mainnet:** `https://api.etherscan.io/api`
- **Ethereum Sepolia:** `https://api-sepolia.etherscan.io/api`
- **BSC Mainnet:** `https://api.bscscan.com/api`
- **BSC Testnet:** `https://api-testnet.bscscan.com/api`
- **Polygon:** `https://api.polygonscan.com/api`
- **Avalanche:** `https://api.snowtrace.io/api`
- **Arbitrum:** `https://api.arbiscan.io/api`
- **Base:** `https://api.basescan.org/api`
- **Optimism:** `https://api-optimistic.etherscan.io/api`
- **Neura Testnet:** `https://testnet-blockscout.infra.neuraprotocol.io/api` (default)

### Generated File Structure

After running the CLI, your subgraph will have this structure:

**Simple app name (`my-token`):**

```
subgraphs/my-token/
├── package.json          # Dependencies and deployment scripts
├── subgraph.yaml         # Subgraph manifest with contract config
├── schema.graphql        # GraphQL schema with entity definitions
├── networks.json         # Network configuration
├── tsconfig.json         # TypeScript configuration
├── abis/
│   └── TokenContract.json # Contract ABI (uses last part of name)
└── src/
    └── my-token.ts       # Event handler mappings
```

**Nested app name (`fr-tn/usn`):**

```
subgraphs/fr-tn/usn/
├── package.json          # Dependencies and deployment scripts
├── subgraph.yaml         # Subgraph manifest with contract config
├── schema.graphql        # GraphQL schema with entity definitions
├── networks.json         # Network configuration
├── tsconfig.json         # TypeScript configuration
├── abis/
│   └── UsnContract.json  # Contract ABI (uses "usn" from fr-tn/usn)
└── src/
    └── fr-tn-usn.ts      # Event handler mappings (/ replaced with -)
```

Each generated file is ready to use without manual modifications, but you can customize them as needed.

### Deploy Endpoints Configuration

The CLI configures deployment endpoints for your subgraph:

- **Graph Node URL** (default: `https://deploy-testnet-graph-neura.infra.neuraprotocol.io/`): The Graph Node endpoint where your subgraph will be deployed
- **IPFS URL** (default: `https://ipfs-testnet-graph-neura.infra.neuraprotocol.io`): The IPFS gateway for storing subgraph files

These endpoints are automatically configured in your `package.json` scripts:

- `yarn create` - Creates the subgraph on the Graph Node
- `yarn deploy` - Deploys the subgraph to the configured endpoints
- `yarn remove` - Removes the subgraph from the Graph Node

---

## 📖 Manual Setup (Alternative Method)

If you prefer to set up your subgraph manually or need more control over the process, follow these steps:

### Prerequisites for Manual Setup

Before starting, ensure you have the following installed:

- **Node.js** (v18 or later)
- **Yarn**
- **npm**
- **Graph CLI**: Install globally with `npm install -g @graphprotocol/graph-cli@0.87.0`
- **Git** for version control

## Step 1: Project Setup

### 1.1 Initialize the Project Directory from ROOT

```bash
mkdir -p subgraphs/app-name/abis
cd subgraphs/app-name
```

## Step 2: Add Contract ABI

### 2.1 Obtain Contract ABI

Get the ABI file for your smart contract and place it in the `abis/` directory.

Example: `subgraphs/app-name/abis/MyContract.json`

### 2.2 Verify ABI Format

Ensure your ABI is a valid JSON array containing the contract's interface definitions.

## Step 3: init graph

```
graph init --skip-git --protocol=ethereum
```

### 3.1 Answers to CLI tool

- Network > Ethereum Mainnet
- Source > Smart contract
- slug: graph endpoint -> For example > my-contract
- Directory to create the subgraph in > .
- Contract address > 0xBd833b6eCC30CAEaBf81dB18BB0f1e00C6997E7a
- Fetching ABI from Sourcify API... Must fail
- Do you want to retry > n
- Failed to fetch start block: Failed to fetch contract deployment transaction .. Must fail
- Do you want to retry> n
- Failed to fetch contract name: Name not found
- Do you want to retry> n
- ABI file (path) > ./abis/MyContract.json
- Start block > 4448873
- Contract name > MyContract
- Index contract events as entities > true
- Directory already exists, do you want to initialize the subgraph here (files will be overwritten) ? > y
- Generate subgraph
  Write subgraph to directory
  ✔ Create subgraph scaffold
  ✔ Initialize networks config
  ✔ Generate ABI and schema types with yarn codegen
- Add another contract? > y/n

## How to Run Locally

### Single Subgraph (Recommended for Development)

Navigate to your specific subgraph directory:

```bash
cd subgraphs/app-name
```

#### 1. Configure Network Connection

Edit the `docker-compose.yml` file in your subgraph directory and update the Ethereum connection:

```yaml
environment:
  # Replace with your RPC URL
  ethereum: "mainnet:https://your-rpc-url-here"
  # Or for other networks:
  # ethereum: "sepolia:https://sepolia.infura.io/v3/YOUR-PROJECT-ID"
  # ethereum: "neura:https://rpc.neuraprotocol.io"
```

#### 2. Start Local Graph Node

```bash
# Start the services (Graph Node, IPFS, PostgreSQL)
docker-compose up -d

# Check if services are running
docker-compose ps
```

#### 3. Create and Deploy Subgraph

```bash
# Generate code from schema and ABI
yarn codegen

# Build the subgraph
yarn build

# Create the subgraph on your local node
graph create --node http://localhost:8020/ app-name

# Deploy the subgraph
graph deploy --node http://localhost:8020/ --ipfs http://localhost:5001 app-name
```

#### 4. Access Your Subgraph

- **GraphQL Playground**: http://localhost:8000/subgraphs/name/app-name
- **Graph Node API**: http://localhost:8020/
- **IPFS Gateway**: http://localhost:5001

---

## 🛠️ Troubleshooting

### CLI Tool Issues

**"Invalid app name. App name cannot contain special characters"**

- App names cannot contain filesystem-reserved characters: `\ < > : " | ? *`
- Forward slashes (`/`) are **allowed** for nested directories: `org/project`, `defi/lending`
- Use hyphens or underscores for naming: `my-token`, `my_token`
- Examples of valid names:
  - Simple: `uniswap-v3`, `lending_protocol`, `nft-marketplace`
  - Nested: `fr-tn/usn`, `defi/aave-v3`, `nft/opensea-seaport`

**"Unable to fetch ABI from block explorer"**

- Verify the block explorer API URL is correct
- Check if the contract is verified on the block explorer
- Try without providing a block explorer URL (the CLI will stop and ask you to provide ABI manually)

**"Invalid contract address format"**

- Ensure the address is a valid Ethereum-style address (0x followed by 40 hexadecimal characters)
- Verify the contract exists on the specified network

**"RPC connection failed"**

- Check your RPC URL is accessible
- Verify the network is running
- Try using a different RPC endpoint

**"No events found in contract ABI"**

- The contract must emit events for the subgraph to be functional
- Verify the contract has event definitions in its ABI
- Check if you're targeting the correct contract address

### General Subgraph Issues

**Build failures:**

```bash
# Clean generated files and rebuild
rm -rf generated/ build/
yarn codegen
yarn build
```

**Deployment failures:**

- Ensure your Graph Node is running
- Check network connectivity
- Verify the subgraph name doesn't already exist

**Sync issues:**

- Check if the start block is correct
- Verify contract address and network match
- Monitor Graph Node logs for errors

## 📚 Additional Resources

- [The Graph Documentation](https://thegraph.com/docs/)
- [GraphQL Schema Reference](https://graphql.org/learn/schema/)
- [AssemblyScript Documentation](https://www.assemblyscript.org/)
- [Neura Protocol Documentation](https://docs.neuraprotocol.io)

## 🤝 Contributing

When contributing new subgraphs to this repository:

1. Use the CLI tool to generate the initial structure
2. Test locally before submitting
3. Follow the existing naming conventions
4. Update documentation as needed

---

_Generated subgraphs are production-ready and follow best practices for indexing blockchain data efficiently._
