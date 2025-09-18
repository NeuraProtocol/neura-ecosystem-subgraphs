# Subgraph Initialization Guide

This guide provides step-by-step instructions for initializing and deploying a subgraph in the Neura ecosystem.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or later)
- **Yarn**
- **npm**
- **Graph CLI**: Install globally with `npm install -g @graphprotocol/graph-cli`
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

Example: `abis/MyContract.json`

### 2.2 Verify ABI Format

Ensure your ABI is a valid JSON array containing the contract's interface definitions.

## Step 3: init graph

```
graph init --skip-git --skip-install  --protocol=ethereum
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
