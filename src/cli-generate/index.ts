#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { ValidationService } from "./services/validation.service";
import { NetworkService } from "./services/network.service";
import { AbiService } from "./services/abi.service";
import { FileGenerationService } from "./services/file-generation.service";
import { LoggerService } from "./services/logger.service";
import { SubgraphConfig, BLOCK_EXPLORER_EXAMPLES } from "./types";

// Create logger instance
const logger = new LoggerService();

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
const question = (query: string): Promise<string> =>
  new Promise((resolve) => rl.question(query, resolve));

// Service instances
let networkService: NetworkService;
let abiService: AbiService;
let fileGenerationService: FileGenerationService;

/**
 * Initialize services
 */
function initializeServices(): void {
  networkService = new NetworkService(logger);
  abiService = new AbiService(logger);
  fileGenerationService = new FileGenerationService(logger);
}

/**
 * Get user inputs through CLI prompts
 */
async function getUserInputs(): Promise<SubgraphConfig> {
  logger.info("Please provide the following information:\n");

  const appName = await question("📝 App name: ");
  if (!ValidationService.isNotEmpty(appName)) {
    logger.error("App name cannot be empty");
    process.exit(1);
  }

  const networkName = await question("🌐 Network name: ");
  if (!ValidationService.isNotEmpty(networkName)) {
    logger.error("Network name cannot be empty");
    process.exit(1);
  }

  const rpcUrl = await question("🔗 RPC URL: ");
  if (!ValidationService.isValidUrl(rpcUrl)) {
    logger.error("Invalid RPC URL format");
    process.exit(1);
  }

  const contractAddress = await question("📋 Contract address: ");
  if (!ValidationService.isValidAddress(contractAddress)) {
    logger.error("Invalid contract address format");
    process.exit(1);
  }

  // Display examples and prompt for block explorer API URL
  logger.info("\n🔍 Block Explorer API (optional - for fetching real ABI):");
  logger.info("Examples:");
  Object.entries(BLOCK_EXPLORER_EXAMPLES).forEach(([name, url]) => {
    logger.info(`  ${name}: ${url}`);
  });

  const explorerApiUrl = await question("\n🌍 Block explorer API URL (press Enter to skip): ");

  if (explorerApiUrl && !ValidationService.isValidUrl(explorerApiUrl)) {
    logger.error("Invalid block explorer API URL format");
    process.exit(1);
  }

  const startBlockInput = await question("📍 Start block (press Enter for 0): ");
  let startBlock = 0;
  if (startBlockInput.trim()) {
    startBlock = parseInt(startBlockInput.trim(), 10);
    if (isNaN(startBlock) || startBlock < 0) {
      logger.error("Invalid start block number");
      process.exit(1);
    }
  }

  return {
    appName: appName.trim(),
    networkName: networkName.trim(),
    rpcUrl: rpcUrl.trim(),
    contractAddress: contractAddress.trim(),
    explorerApiUrl: explorerApiUrl.trim() || undefined,
    startBlock
  };
}

/**
 * Main CLI function
 */
async function main(): Promise<void> {
  try {
    logger.title("\n🚀 Subgraph Generator CLI\n");

    // Initialize services
    initializeServices();

    // Get user inputs
    const config = await getUserInputs();

    logger.info("\n📡 Testing RPC connection and fetching contract ABI...");

    // Verify contract exists
    try {
      await networkService.verifyContract(config.rpcUrl, config.contractAddress);
    } catch (error) {
      logger.error((error as Error).message);
      process.exit(1);
    }

    // Fetch ABI
    let abi;
    try {
      abi = await abiService.fetchContractABI(
        config.rpcUrl,
        config.contractAddress,
        config.explorerApiUrl
      );
    } catch (error) {
      logger.error((error as Error).message);
      process.exit(1);
    }

    // Create directory structure
    const subgraphDir = path.join(process.cwd(), "subgraphs", config.appName);

    if (fs.existsSync(subgraphDir)) {
      logger.error(`Subgraph directory '${config.appName}' already exists`);
      process.exit(1);
    }

    logger.info("📁 Creating directory structure...");
    fs.mkdirSync(subgraphDir, { recursive: true });
    logger.success("Directory structure created");

    // Generate template files
    logger.info("📄 Generating template files...");
    await fileGenerationService.generateTemplateFiles(
      subgraphDir,
      config.appName,
      config.networkName,
      config.contractAddress,
      abi,
      config.startBlock || 0
    );

    logger.success(`✨ Subgraph '${config.appName}' generated successfully!`);
    logger.info(`📁 Location: ${subgraphDir}`);
    logger.info("\n🎯 Next steps:");
    logger.info(`   cd subgraphs/${config.appName}`);
    logger.info("   yarn install");
    logger.info("   yarn codegen");
    logger.info("   yarn build");

    rl.close();
  } catch (error) {
    logger.error(`An error occurred: ${(error as Error).message}`);
    rl.close();
    process.exit(1);
  }
}

// Run the CLI
if (require.main === module) {
  main();
}

// Export services and functions for potential external use
export {
  ValidationService,
  NetworkService,
  AbiService,
  FileGenerationService,
  LoggerService,
  BLOCK_EXPLORER_EXAMPLES
};
