#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const https = require("https");
const http = require("http");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m"
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg) => console.log(`${colors.bright}${colors.blue}${msg}${colors.reset}`)
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Validate contract address format
function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Validate URL format
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Common block explorer examples for reference
const BLOCK_EXPLORER_EXAMPLES = {
  "Etherscan (Mainnet)": "https://api.etherscan.io/api",
  "Etherscan (Sepolia)": "https://api-sepolia.etherscan.io/api",
  "BSCScan (Mainnet)": "https://api.bscscan.com/api",
  "BSCScan (Testnet)": "https://api-testnet.bscscan.com/api",
  PolygonScan: "https://api.polygonscan.com/api",
  Arbiscan: "https://api.arbiscan.io/api",
  BaseScan: "https://api.basescan.org/api",
  "Snowtrace (Avalanche)": "https://api.snowtrace.io/api"
};

// Verify contract exists on blockchain
async function verifyContract(rpcUrl, contractAddress) {
  return new Promise((resolve, reject) => {
    const url = new URL(rpcUrl);
    const client = url.protocol === "https:" ? https : http;

    const data = JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_getCode",
      params: [contractAddress, "latest"],
      id: 1
    });

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length
      },
      timeout: 10000
    };

    const req = client.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        try {
          const response = JSON.parse(responseData);

          if (response.error) {
            reject(new Error(`RPC Error: ${response.error.message}`));
            return;
          }

          if (response.result === "0x" || response.result === "0x0") {
            reject(new Error("No contract found at the specified address"));
            return;
          }

          resolve(true);
        } catch (error) {
          reject(new Error("Failed to parse RPC response"));
        }
      });
    });

    req.on("error", (error) => {
      if (error.code === "ECONNREFUSED") {
        reject(new Error("Unable to connect to RPC endpoint. Please check the URL and try again."));
      } else if (error.code === "ENOTFOUND") {
        reject(new Error("RPC endpoint not found. Please check the URL and try again."));
      } else if (error.code === "ETIMEDOUT") {
        reject(new Error("Connection to RPC endpoint timed out. Please try again."));
      } else {
        reject(new Error(`Connection error: ${error.message}`));
      }
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Connection to RPC endpoint timed out. Please try again."));
    });

    req.write(data);
    req.end();
  });
}

// Fetch ABI from block explorer
async function fetchABIFromExplorer(explorerApiUrl, contractAddress) {
  if (!explorerApiUrl) {
    throw new Error("Block explorer API URL is required");
  }

  return new Promise((resolve, reject) => {
    const apiUrl = `${explorerApiUrl}?module=contract&action=getabi&address=${contractAddress}&apikey=YourApiKeyToken`;

    const client = https;
    const url = new URL(apiUrl);

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: "GET",
      timeout: 15000
    };

    const req = client.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        try {
          const response = JSON.parse(responseData);

          if (response.status !== "1") {
            if (response.result && response.result.includes("Contract source code not verified")) {
              reject(
                new Error(
                  "Contract not verified on block explorer. Cannot fetch ABI automatically."
                )
              );
            } else {
              reject(new Error(`Block explorer API Error: ${response.result || "Unknown error"}`));
            }
            return;
          }

          const abi = JSON.parse(response.result);
          if (!Array.isArray(abi) || abi.length === 0) {
            reject(new Error("Invalid or empty ABI received from block explorer"));
            return;
          }

          resolve(abi);
        } catch (error) {
          reject(new Error(`Failed to parse block explorer response: ${error.message}`));
        }
      });
    });

    req.on("error", (error) => {
      if (error.code === "ECONNREFUSED") {
        reject(new Error("Unable to connect to block explorer. Please try again later."));
      } else if (error.code === "ENOTFOUND") {
        reject(new Error("Block explorer not found. Please check the API URL."));
      } else if (error.code === "ETIMEDOUT") {
        reject(new Error("Connection to block explorer timed out. Please try again."));
      } else {
        reject(new Error(`Block explorer connection error: ${error.message}`));
      }
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Connection to block explorer timed out. Please try again."));
    });

    req.end();
  });
}

// Create fallback ABI with common events
function createFallbackABI() {
  return [
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: "address", name: "from", type: "address" },
        { indexed: true, internalType: "address", name: "to", type: "address" },
        { indexed: false, internalType: "uint256", name: "value", type: "uint256" }
      ],
      name: "Transfer",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: "address", name: "owner", type: "address" },
        { indexed: true, internalType: "address", name: "spender", type: "address" },
        { indexed: false, internalType: "uint256", name: "value", type: "uint256" }
      ],
      name: "Approval",
      type: "event"
    }
  ];
}

// Main function to fetch contract ABI
async function fetchContractABI(rpcUrl, contractAddress, explorerApiUrl = null) {
  // First verify contract exists
  try {
    await verifyContract(rpcUrl, contractAddress);
    log.success("Contract found on blockchain");
  } catch (error) {
    throw error;
  }

  // Try to fetch ABI from block explorer if URL provided
  if (explorerApiUrl && explorerApiUrl.trim()) {
    try {
      log.info("Fetching ABI from block explorer...");
      const abi = await fetchABIFromExplorer(explorerApiUrl, contractAddress);

      const events = abi.filter((item) => item.type === "event");
      log.success(`Successfully fetched ABI with ${events.length} events from block explorer`);

      if (events.length === 0) {
        log.warning("No events found in contract ABI. Using fallback ABI.");
        return createFallbackABI();
      }

      return abi;
    } catch (error) {
      log.warning(`Block explorer fetch failed: ${error.message}`);
      log.warning("Using fallback ABI with common events...");
      return createFallbackABI();
    }
  } else {
    log.warning("No block explorer API URL provided.");
    log.warning("Using fallback ABI with common events...");
    return createFallbackABI();
  }
}

// Generate template files
async function generateTemplateFiles(subgraphDir, appName, networkName, contractAddress, abi) {
  const capitalizedName = appName.charAt(0).toUpperCase() + appName.slice(1);
  const contractName = capitalizedName + "Contract";

  // Generate package.json
  const packageJson = {
    name: appName.toLowerCase(),
    license: "UNLICENSED",
    scripts: {
      codegen: "graph codegen",
      build: "graph build",
      create: `graph create --node https://deploy-testnet-graph-${networkName}.infra.neuraprotocol.io/ ${appName}`,
      remove: `graph remove --node https://deploy-testnet-graph-${networkName}.infra.neuraprotocol.io/ ${appName}`,
      deploy: `graph deploy --node https://deploy-testnet-graph-${networkName}.infra.neuraprotocol.io/ --ipfs https://ipfs-testnet-graph-${networkName}.infra.neuraprotocol.io ${appName}`,
      test: "graph test"
    },
    dependencies: {
      "@graphprotocol/graph-cli": "0.97.1",
      "@graphprotocol/graph-ts": "0.37.0"
    },
    devDependencies: {
      "matchstick-as": "0.6.0"
    }
  };
  fs.writeFileSync(path.join(subgraphDir, "package.json"), JSON.stringify(packageJson, null, 2));

  // Generate networks.json
  const networksJson = {
    [networkName]: {
      [contractName]: {
        address: contractAddress,
        startBlock: 0
      }
    }
  };
  fs.writeFileSync(path.join(subgraphDir, "networks.json"), JSON.stringify(networksJson, null, 2));

  // Generate tsconfig.json
  const tsconfigJson = {
    extends: "@graphprotocol/graph-ts/types/tsconfig.base.json",
    include: ["src", "tests"]
  };
  fs.writeFileSync(path.join(subgraphDir, "tsconfig.json"), JSON.stringify(tsconfigJson, null, 2));

  // Save ABI file
  fs.writeFileSync(
    path.join(subgraphDir, "abis", `${contractName}.json`),
    JSON.stringify(abi, null, 2)
  );

  // Generate subgraph.yaml
  const events = abi.filter((item) => item.type === "event");

  if (events.length === 0) {
    log.warning("No events found in ABI. The generated subgraph may not be functional.");
  } else {
    log.info(`Processing ${events.length} events: ${events.map((e) => e.name).join(", ")}`);
  }

  const eventHandlers = events
    .map(
      (event) =>
        `        - event: ${event.name}(${event.inputs
          .map((input) => `${input.indexed ? "indexed " : ""}${input.type}`)
          .join(",")})
          handler: handle${event.name}`
    )
    .join("\n");

  const entities = events.map((event) => `        - ${event.name}`).join("\n");

  const subgraphYaml = `specVersion: 1.2.0
indexerHints:
  prune: auto
schema:
  file: ./schema.graphql
dataSources:
  - kind: ethereum
    name: ${contractName}
    network: ${networkName}
    source:
      address: "${contractAddress}"
      abi: ${contractName}
      startBlock: 0
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.9
      language: wasm/assemblyscript
      entities:
${entities}
      abis:
        - name: ${contractName}
          file: ./abis/${contractName}.json
      eventHandlers:
${eventHandlers}
      file: ./src/${appName.toLowerCase()}.ts`;

  fs.writeFileSync(path.join(subgraphDir, "subgraph.yaml"), subgraphYaml);

  // Generate schema.graphql
  const schemaEntities = events
    .map((event) => {
      const fields = event.inputs
        .map((input) => {
          let graphqlType;
          if (input.type === "address") graphqlType = "Bytes!";
          else if (input.type.startsWith("uint") || input.type.startsWith("int"))
            graphqlType = "BigInt!";
          else if (input.type === "bool") graphqlType = "Boolean!";
          else if (input.type === "string") graphqlType = "String!";
          else if (input.type === "bytes" || input.type.startsWith("bytes")) graphqlType = "Bytes!";
          else graphqlType = "Bytes!"; // fallback

          return `  ${input.name}: ${graphqlType} # ${input.type}`;
        })
        .join("\n");

      return `type ${event.name} @entity(immutable: true) {
  id: Bytes!
${fields}
  blockNumber: BigInt!
  blockTimestamp: BigInt!
  transactionHash: Bytes!
}`;
    })
    .join("\n\n");

  fs.writeFileSync(path.join(subgraphDir, "schema.graphql"), schemaEntities);

  // Generate mapping file
  const imports = events.map((event) => `  ${event.name} as ${event.name}Event`).join(",\n");
  const entityImports = events.map((event) => `  ${event.name}`).join(",\n");

  const handlers = events
    .map((event) => {
      const params = event.inputs
        .map((input) => `  entity.${input.name} = event.params.${input.name}`)
        .join("\n");

      return `export function handle${event.name}(event: ${event.name}Event): void {
  let entity = new ${event.name}(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
${params}

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}`;
    })
    .join("\n\n");

  const mappingTs = `import {
${imports}
} from "../generated/${contractName}/${contractName}"
import {
${entityImports}
} from "../generated/schema"

${handlers}`;

  fs.writeFileSync(path.join(subgraphDir, "src", `${appName.toLowerCase()}.ts`), mappingTs);

  // Generate basic test file
  const testFile = `import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { ExampleEntity } from "../generated/schema"
import { handle${events[0]?.name || "Event"} } from "../src/${appName.toLowerCase()}"
import { create${events[0]?.name || "Event"}Event } from "./${appName.toLowerCase()}-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    // Add test setup here
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("Example test", () => {
    // Add your test logic here
    assert.assertTrue(true)
  })
})`;

  fs.writeFileSync(path.join(subgraphDir, "tests", `${appName.toLowerCase()}.test.ts`), testFile);

  // Generate test utils file
  const testUtils = `import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
${events
  .map((event) => `import { ${event.name} } from "../generated/${contractName}/${contractName}"`)
  .join("\n")}

${events
  .map((event) => {
    const params = event.inputs
      .map((input, index) => `  ${input.name}Param.value = ${input.name}`)
      .join("\n");

    const paramCreation = event.inputs
      .map((input, index) => {
        let ethereumType;
        if (input.type === "address") ethereumType = "ethereum.Value.fromAddress";
        else if (input.type.startsWith("uint") || input.type.startsWith("int"))
          ethereumType = "ethereum.Value.fromUnsignedBigInt";
        else if (input.type === "bool") ethereumType = "ethereum.Value.fromBoolean";
        else if (input.type === "string") ethereumType = "ethereum.Value.fromString";
        else if (input.type === "bytes" || input.type.startsWith("bytes"))
          ethereumType = "ethereum.Value.fromBytes";
        else ethereumType = "ethereum.Value.fromBytes"; // fallback

        return `  let ${input.name}Param = new ethereum.EventParam("${input.name}", ${ethereumType}(${input.name}))`;
      })
      .join("\n");

    const paramNames = event.inputs.map((input) => `${input.name}Param`).join(", ");

    return `export function create${event.name}Event(${event.inputs
      .map((input) => {
        let tsType;
        if (input.type === "address") tsType = "Address";
        else if (input.type.startsWith("uint") || input.type.startsWith("int")) tsType = "BigInt";
        else if (input.type === "bool") tsType = "boolean";
        else if (input.type === "string") tsType = "string";
        else if (input.type === "bytes" || input.type.startsWith("bytes")) tsType = "Bytes";
        else tsType = "Bytes";

        return `${input.name}: ${tsType}`;
      })
      .join(", ")}): ${event.name} {
  let mock${event.name}Event = changetype<${event.name}>(newMockEvent())

${paramCreation}

  mock${event.name}Event.parameters = new Array()
${event.inputs
  .map((input, index) => `  mock${event.name}Event.parameters.push(${input.name}Param)`)
  .join("\n")}

  return mock${event.name}Event
}`;
  })
  .join("\n\n")}`;

  fs.writeFileSync(path.join(subgraphDir, "tests", `${appName.toLowerCase()}-utils.ts`), testUtils);
}

// Main CLI function
async function main() {
  try {
    log.title("\n🚀 Subgraph Generator CLI\n");

    // Get user inputs
    log.info("Please provide the following information:\n");

    const appName = await question("📝 App name: ");
    if (!appName.trim()) {
      log.error("App name cannot be empty");
      process.exit(1);
    }

    const networkName = await question("🌐 Network name: ");
    if (!networkName.trim()) {
      log.error("Network name cannot be empty");
      process.exit(1);
    }

    const rpcUrl = await question("🔗 RPC URL: ");
    if (!isValidUrl(rpcUrl)) {
      log.error("Invalid RPC URL format");
      process.exit(1);
    }

    const contractAddress = await question("📋 Contract address: ");
    if (!isValidAddress(contractAddress)) {
      log.error("Invalid contract address format");
      process.exit(1);
    }

    // Display examples and prompt for block explorer API URL
    log.info("\n🔍 Block Explorer API (optional - for fetching real ABI):");
    log.info("Examples:");
    Object.entries(BLOCK_EXPLORER_EXAMPLES).forEach(([name, url]) => {
      log.info(`  ${name}: ${url}`);
    });

    const explorerApiUrl = await question("\n🌍 Block explorer API URL (press Enter to skip): ");

    if (explorerApiUrl && !isValidUrl(explorerApiUrl)) {
      log.error("Invalid block explorer API URL format");
      process.exit(1);
    }

    log.info("\n📡 Testing RPC connection and fetching contract ABI...");

    // Fetch ABI from blockchain
    let abi;
    try {
      abi = await fetchContractABI(rpcUrl, contractAddress, explorerApiUrl);
    } catch (error) {
      log.error(error.message);
      process.exit(1);
    }

    // Create directory structure
    const subgraphDir = path.join(__dirname, "subgraphs", appName);

    if (fs.existsSync(subgraphDir)) {
      log.error(`Subgraph directory '${appName}' already exists`);
      process.exit(1);
    }

    log.info("📁 Creating directory structure...");
    fs.mkdirSync(subgraphDir, { recursive: true });
    fs.mkdirSync(path.join(subgraphDir, "abis"));
    fs.mkdirSync(path.join(subgraphDir, "src"));
    fs.mkdirSync(path.join(subgraphDir, "tests"));

    log.success("Directory structure created");

    // Generate template files
    log.info("📄 Generating template files...");
    await generateTemplateFiles(subgraphDir, appName, networkName, contractAddress, abi);

    log.success(`✨ Subgraph '${appName}' generated successfully!`);
    log.info(`📁 Location: ${subgraphDir}`);
    log.info("\n🎯 Next steps:");
    log.info(`   cd subgraphs/${appName}`);
    log.info("   yarn install");
    log.info("   yarn codegen");
    log.info("   yarn build");

    rl.close();
  } catch (error) {
    log.error(`An error occurred: ${error.message}`);
    rl.close();
    process.exit(1);
  }
}

// Run the CLI
if (require.main === module) {
  main();
}

module.exports = {
  fetchContractABI,
  fetchABIFromExplorer,
  verifyContract,
  isValidAddress,
  isValidUrl,
  createFallbackABI,
  BLOCK_EXPLORER_EXAMPLES
};
