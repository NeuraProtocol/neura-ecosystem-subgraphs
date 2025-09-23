import * as fs from "fs";
import * as path from "path";
import { ABI, ABIEvent, ABIInput, PackageJson, NetworksConfig, TSConfig, Logger } from "../types";

export class FileGenerationService {
  constructor(private logger: Logger) {}

  generatePackageJson(
    appName: string,
    networkName: string,
    deployNodeUrl: string,
    ipfsUrl: string
  ): PackageJson {
    return {
      name: appName.toLowerCase(),
      license: "UNLICENSED",
      scripts: {
        codegen: "graph codegen",
        build: "graph build",
        create: `graph create --node ${deployNodeUrl} ${appName}`,
        remove: `graph remove --node ${deployNodeUrl} ${appName}`,
        deploy: `graph deploy --node ${deployNodeUrl} --ipfs ${ipfsUrl} ${appName}`
      },
      dependencies: {
        "@graphprotocol/graph-cli": "0.97.1",
        "@graphprotocol/graph-ts": "0.37.0"
      },
      devDependencies: {}
    };
  }

  generateNetworksJson(
    appName: string,
    networkName: string,
    contractAddress: string,
    startBlock: number = 0
  ): NetworksConfig {
    const capitalizedName = appName.charAt(0).toUpperCase() + appName.slice(1);
    const contractName = capitalizedName + "Contract";

    return {
      [networkName]: {
        [contractName]: {
          address: contractAddress,
          startBlock: startBlock
        }
      }
    };
  }

  generateTSConfig(): TSConfig {
    return {
      extends: "@graphprotocol/graph-ts/types/tsconfig.base.json",
      include: ["src"]
    };
  }

  generateSubgraphYaml(
    appName: string,
    networkName: string,
    contractAddress: string,
    abi: ABI,
    startBlock: number = 0
  ): string {
    const capitalizedName = appName.charAt(0).toUpperCase() + appName.slice(1);
    const contractName = capitalizedName + "Contract";

    const events = abi.filter((item) => item.type === "event") as ABIEvent[];

    if (events.length === 0) {
      this.logger.warning("No events found in ABI. The generated subgraph may not be functional.");
    } else {
      this.logger.info(
        `Processing ${events.length} events: ${events.map((e) => e.name).join(", ")}`
      );
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

    return `specVersion: 1.2.0
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
      startBlock: ${startBlock}
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
  }

  generateSchemaGraphql(abi: ABI): string {
    const events = abi.filter((item) => item.type === "event") as ABIEvent[];

    const schemaEntities = events
      .map((event) => {
        const fields = event.inputs
          .map((input) => {
            const graphqlType = this.mapSolidityTypeToGraphQL(input.type);
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

    return schemaEntities;
  }

  generateMappingFile(appName: string, abi: ABI): string {
    const capitalizedName = appName.charAt(0).toUpperCase() + appName.slice(1);
    const contractName = capitalizedName + "Contract";

    const events = abi.filter((item) => item.type === "event") as ABIEvent[];

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

    return `import {
${imports}
} from "../generated/${contractName}/${contractName}"
import {
${entityImports}
} from "../generated/schema"

${handlers}`;
  }

  async generateTemplateFiles(
    subgraphDir: string,
    appName: string,
    networkName: string,
    contractAddress: string,
    abi: ABI,
    startBlock: number = 0,
    deployNodeUrl: string,
    ipfsUrl: string
  ): Promise<void> {
    const capitalizedName = appName.charAt(0).toUpperCase() + appName.slice(1);
    const contractName = capitalizedName + "Contract";

    // Create directories
    fs.mkdirSync(path.join(subgraphDir, "abis"), { recursive: true });
    fs.mkdirSync(path.join(subgraphDir, "src"));

    // Generate and write package.json
    const packageJson = this.generatePackageJson(appName, networkName, deployNodeUrl, ipfsUrl);
    fs.writeFileSync(path.join(subgraphDir, "package.json"), JSON.stringify(packageJson, null, 2));

    // Generate and write networks.json
    const networksJson = this.generateNetworksJson(
      appName,
      networkName,
      contractAddress,
      startBlock
    );
    fs.writeFileSync(
      path.join(subgraphDir, "networks.json"),
      JSON.stringify(networksJson, null, 2)
    );

    // Generate and write tsconfig.json
    const tsconfigJson = this.generateTSConfig();
    fs.writeFileSync(
      path.join(subgraphDir, "tsconfig.json"),
      JSON.stringify(tsconfigJson, null, 2)
    );

    // Save ABI file
    fs.writeFileSync(
      path.join(subgraphDir, "abis", `${contractName}.json`),
      JSON.stringify(abi, null, 2)
    );

    // Generate and write subgraph.yaml
    const subgraphYaml = this.generateSubgraphYaml(
      appName,
      networkName,
      contractAddress,
      abi,
      startBlock
    );
    fs.writeFileSync(path.join(subgraphDir, "subgraph.yaml"), subgraphYaml);

    // Generate and write schema.graphql
    const schemaGraphql = this.generateSchemaGraphql(abi);
    fs.writeFileSync(path.join(subgraphDir, "schema.graphql"), schemaGraphql);

    // Generate and write mapping file
    const mappingFile = this.generateMappingFile(appName, abi);
    fs.writeFileSync(path.join(subgraphDir, "src", `${appName.toLowerCase()}.ts`), mappingFile);
  }

  /**
   * Map Solidity types to GraphQL types
   */
  private mapSolidityTypeToGraphQL(solidityType: string): string {
    if (solidityType === "address") return "Bytes!";
    if (solidityType.startsWith("uint") || solidityType.startsWith("int")) return "BigInt!";
    if (solidityType === "bool") return "Boolean!";
    if (solidityType === "string") return "String!";
    if (solidityType === "bytes" || solidityType.startsWith("bytes")) return "Bytes!";
    return "Bytes!"; // fallback
  }
}
