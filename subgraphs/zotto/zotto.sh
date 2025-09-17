# generate the PositionManager.ts and schema for Position Manager
graph codegen subgraph.yaml

graph build subgraph.yaml --network neura

graph create --node https://deploy-testnet-graph-neura.infra.neuraprotocol.io/ pm

graph deploy --network neura --node https://deploy-testnet-graph-neura.infra.neuraprotocol.io/ --ipfs https://ipfs-testnet-graph-neura.infra.neuraprotocol.io pm subgraph.yaml