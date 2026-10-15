import { describe, it } from "node:test";
import * as assert from "node:assert";
import { ValidationService } from "../services/validation.service";
import { FileGenerationService } from "../services/file-generation.service";
import { LoggerService } from "../services/logger.service";
import { ABI } from "../types";

describe("ValidationService", () => {
  it("validates URLs correctly", () => {
    assert.strictEqual(ValidationService.isValidUrl("https://api.etherscan.io/api"), true);
    assert.strictEqual(ValidationService.isValidUrl("http://localhost:4000/api"), true);
    assert.strictEqual(ValidationService.isValidUrl("ftp://invalid.com"), false);
    assert.strictEqual(ValidationService.isValidUrl("not-a-url"), false);
  });

  it("validates app names correctly", () => {
    assert.strictEqual(ValidationService.isValidAppName("my-app"), true);
    assert.strictEqual(ValidationService.isValidAppName("team/my-app"), true);
    assert.strictEqual(ValidationService.isValidAppName("invalid:name"), false);
    assert.strictEqual(ValidationService.isValidAppName(""), false);
  });
});

describe("FileGenerationService", () => {
  const logger = new LoggerService();
  const service = new FileGenerationService(logger);

  it("generates valid package.json for nested app name", () => {
    const pkg = service.generatePackageJson(
      "org/my-subgraph",
      "mainnet",
      "http://localhost:8020/",
      "http://localhost:5001"
    );
    // Package name must be valid npm name without forward slashes
    assert.strictEqual(pkg.name, "my-subgraph");
    assert.strictEqual(pkg.scripts.create.includes("org/my-subgraph"), true);
  });

  it("handles unnamed event parameters, id collision, and array types in GraphQL schema", () => {
    const testAbi: ABI = [
      {
        type: "event",
        name: "TestEvent",
        inputs: [
          { name: "id", type: "uint256", indexed: false },
          { name: "", type: "address", indexed: true },
          { name: "recipients", type: "address[]", indexed: false }
        ]
      }
    ];

    const schema = service.generateSchemaGraphql(testAbi);
    // id field must be renamed to _id to avoid conflict with entity id: Bytes!
    assert.strictEqual(schema.includes("  _id: BigInt! # uint256"), true);
    // unnamed parameter must be named param1
    assert.strictEqual(schema.includes("  param1: Bytes! # address"), true);
    // array type must be [Bytes!]!
    assert.strictEqual(schema.includes("  recipients: [Bytes!]! # address[]"), true);
  });
});
