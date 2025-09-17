# Multi-Network Subgraph Deployment Guide

This guide explains how to set up and deploy subgraphs to multiple networks using The Graph Node.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Running the Infrastructure](#running-the-infrastructure)
- [Deploying Subgraphs](#deploying-subgraphs)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Docker and Docker Compose
- Node.js (v16 or later)
- Yarn package manager
- RPC URLs

## Running the Infrastructure

1. Initialize the project:
```bash
yarn install
```

2. Generate types and build subgraphs:
```bash
# Generate types from contract ABIs
yarn codegen

# Build both subgraphs
yarn build
```

3. Start the infrastructure:
```bash
# Clean up any existing data
docker-compose down -v
rm -rf ./data/ipfs ./data/postgres

# Start services
docker-compose up -d
```

4. Check service status:
```bash
docker-compose ps
docker-compose logs -f
```

## Deploying Subgraphs

```bash
# Create and deploy
yarn create-local-all
yarn deploy-local-all
```

## Accessing the Subgraphs

- Ethereum Subgraph: http://localhost:8000/subgraphs/name/test-eth
- BSC Subgraph: http://localhost:9000/subgraphs/name/test-bsc

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
docker-compose down -v
rm -rf ./data/postgres
docker-compose up
```

#### Port Conflicts
```bash
# Check for running containers
docker ps

# Stop conflicting containers
docker-compose down
```

#### Network Resolution Errors
- Verify RPC URLs in .env file
- Check network names in subgraph.yaml match docker-compose.yml

### Useful Commands
```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Clean start
docker-compose down -v
rm -rf ./data
docker-compose up -d
```

## Notes

- Each Graph Node runs on different ports to avoid conflicts:
  - Ethereum: 8xxx ports
  - BSC: 9xxx ports
- Both nodes share the same IPFS and Postgres instances
- Remember to replace placeholder API keys in .env file
- Set appropriate start block numbers in subgraph.yaml

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the [MIT License](LICENSE).

---

For more information, visit [The Graph Documentation](https://thegraph.com/docs/en/).
