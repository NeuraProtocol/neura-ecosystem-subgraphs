import * as https from "https";
import * as http from "http";
import { RpcResponse, Logger } from "../types";

export class NetworkService {
  constructor(private logger: Logger) {}

  async verifyContract(rpcUrl: string, contractAddress: string): Promise<boolean> {
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
            const response: RpcResponse = JSON.parse(responseData);

            if (response.error) {
              reject(new Error(`RPC Error: ${response.error.message}`));
              return;
            }

            if (response.result === "0x" || response.result === "0x0") {
              reject(new Error("No contract found at the specified address"));
              return;
            }

            this.logger.success("Contract found on blockchain");
            resolve(true);
          } catch (error) {
            reject(new Error("Failed to parse RPC response"));
          }
        });
      });

      req.on("error", (error: NodeJS.ErrnoException) => {
        if (error.code === "ECONNREFUSED") {
          reject(
            new Error("Unable to connect to RPC endpoint. Please check the URL and try again.")
          );
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
}
