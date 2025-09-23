import * as https from "https";
import { ABI, ABIEvent, BlockExplorerResponse, Logger } from "../types";

export class AbiService {
  constructor(private logger: Logger) {}

  async fetchABIFromExplorer(explorerApiUrl: string, contractAddress: string): Promise<ABI> {
    if (!explorerApiUrl) {
      throw new Error("Block explorer API URL is required");
    }

    return new Promise((resolve, reject) => {
      const apiUrl = `${explorerApiUrl}?module=contract&action=getabi&address=${contractAddress}&apikey=YourApiKeyToken`;

      const url = new URL(apiUrl);

      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: "GET",
        timeout: 15000
      };

      const req = https.request(options, (res) => {
        let responseData = "";

        res.on("data", (chunk) => {
          responseData += chunk;
        });

        res.on("end", () => {
          try {
            const response: BlockExplorerResponse = JSON.parse(responseData);

            if (response.status !== "1") {
              if (
                response.result &&
                response.result.includes("Contract source code not verified")
              ) {
                reject(
                  new Error(
                    "Contract not verified on block explorer. Cannot fetch ABI automatically."
                  )
                );
              } else {
                reject(
                  new Error(`Block explorer API Error: ${response.result || "Unknown error"}`)
                );
              }
              return;
            }

            const abi: ABI = JSON.parse(response.result);
            if (!Array.isArray(abi) || abi.length === 0) {
              reject(new Error("Invalid or empty ABI received from block explorer"));
              return;
            }

            resolve(abi);
          } catch (error) {
            reject(
              new Error(`Failed to parse block explorer response: ${(error as Error).message}`)
            );
          }
        });
      });

      req.on("error", (error: NodeJS.ErrnoException) => {
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

  async fetchContractABI(
    rpcUrl: string,
    contractAddress: string,
    explorerApiUrl?: string
  ): Promise<ABI> {
    if (explorerApiUrl && explorerApiUrl.trim()) {
      try {
        this.logger.info("Fetching ABI from block explorer...");
        const abi = await this.fetchABIFromExplorer(explorerApiUrl, contractAddress);

        const events = abi.filter((item) => item.type === "event") as ABIEvent[];
        this.logger.success(
          `Successfully fetched ABI with ${events.length} events from block explorer`
        );

        if (events.length === 0) {
          throw new Error(
            "No events found in contract ABI. Cannot generate subgraph without events."
          );
        }

        return abi;
      } catch (error) {
        this.logger.error(`Block explorer fetch failed: ${(error as Error).message}`);
        throw new Error(`Unable to fetch ABI from block explorer: ${(error as Error).message}`);
      }
    } else {
      throw new Error(
        "No block explorer API URL provided. Cannot fetch contract ABI without explorer URL."
      );
    }
  }
}
