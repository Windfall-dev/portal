# Windfall on-chain raffle program

This repository contains the raffle program that implements Windfall's on-chain raffle.

We are participating in the Solana Radar Hackathon 2024, and this repository contains the raffle contract portion of our project.

## Current Development Status

At this point in development, our focus is on demonstrating technical feasibility.

We have prioritized implementing core functionalities that showcase the innovative aspects of our system.

As such, some features that are relatively straightforward to implement (though requiring careful security considerations), such as token payouts, have been deferred to a later stage of development.


## Technical Implementation Highlights

1. **ZK Compressed Accounts**: We leverage Light Protocol's compressed accounts to significantly reduce on-chain storage costs. This allows for efficient storage of user data and raffle entries.

2. **Ephemeral Rollups**: Our integration with MagicBlock's Ephemeral Rollups enables gas-less transactions for drawing winners, enhancing scalability and reducing on-chain transaction costs.

3. **Verifiable Random Function (VRF)** (in progress): We incorporate a secure randomness source using a VRF, ensuring fair and tamper-resistant prize drawings.

4. **Merkle Tree for Eligibility** (confirmed in prototype): For private raffles, we use a Merkle tree to efficiently verify user eligibility without storing all eligible addresses on-chain.

These technical features demonstrate our commitment to building a scalable, efficient, and secure on-chain raffle system on Solana.

## Prerequisites

- Solana CLI 1.18.22+
- Anchor 0.29.0
- Light Protocol Github repository

## Build

Clone [Light Protocol](https://github.com/Lightprotocol/light-protocol) (commit hash 1eed6e8d6f742de68bf4fce3eebffb3403f8d3d6) parallel to this repository, and build the Light Protocol repository first. Please refer to the Light Protocol README for build instructions.

Copy `env.sample` to `.env` and edit the configuration appropriately for your environment.

Then, you can build our raffle program with the following commands:

```shell
npm install
anchor build
```

## Test

You can run local tests with the following commands:

```shell
# This spawns 3 processes (Solana test validator, indexer, and prover)
light test-validator

# Execute local tests.
anchor test --skip-build --skip-local-validator

# Once tests complete, you may want to stop the spawned processes like this:
light test-validator --stop
```

### Note on Testing with MagicBlock's Ephemeral Rollups

Local tests do not include MagicBlock's Ephemeral Rollups functionality. To test this feature, please deploy the program to devnet first and then run the tests on devnet.
