# Button Game on Lukso

This repository contains a blockchain-based Button Game built on the Lukso network, forked from the [Lukso Playground Starter Repo](https://github.com/lukso-network/playground-starter). The game implements a simple yet engaging mechanic where players press a button to participate and potentially win prizes.

## Repository Structure

- **Smart Contracts**: Located in the `contracts/` directory
  - Main contract: `contracts/ButtonGame.sol`
- **Scripts**: Deployment and update scripts in `scripts/`
  - Deployment: `scripts/deployButtonGame.ts`
  - Configuration: `scripts/updateCountdownDuration.ts`
- **UI**: Frontend interface located in the root directory
  - Source files and assets for the user interface

## About the Game

The Button Game is deployed on Lukso Mainnet and features:

- A countdown-based mechanic
- Prize distribution system
- Charity contribution component
- Configurable parameters (entry fee, duration, shares)

## Deployment

- **Smart Contract**: Deployed on Lukso Mainnet
- **UI**: Hosted at [Universal Profile URL](https://universaleverything.io/0x2cf7840ffd6C89F54016Cb3AB7b6a90cfAedF2E7?assetGroup=grid)

## Getting Started

1. Clone this repository
2. Install dependencies with `bun install`
3. Configure environment variables in `.env` (see `.env.example`)
4. Compile contracts: `bun hardhat compile`
5. Deploy or interact with contracts using the scripts

## Usage

- To deploy: `bun hardhat run scripts/deployButtonGame.ts --network luksoMainnet`
- To update configuration: `bun hardhat run scripts/updateCountdownDuration.ts --network luksoMainnet`
- Access the UI through the Universal Profile URL above

## Credits

Built upon the Lukso Playground Starter Repo framework, customized for the Button Game implementation.
