# Windfall staking program

This repository contains the staking program that implements Windfall's staking hub feature.

We are participating in the Solana Radar Hackathon 2024, and this repository contains the staking contract portion of our project.

## Current Development Status

At this point in development, our focus is on demonstrating technical feasibility.

We have prioritized implementing core functionalities that showcase the innovative aspects of our system.

As such, some common features that are relatively straightforward to implement (though requiring careful security considerations), such as token deposits / withdrawals, have been deferred to a later stage of development.

## Technical Implementation Highlights

1. **Player Profile NFT**: We have adopted Metaplex's Core Asset for Core NFT implementation. When a user creates a staking account, an NFT is automatically minted by the contract. User status, which reflects the user's rank and staking amount, is associated with the NFT's attributes. Users can transfer and/or trade their NFTs along with their status.

2. **Integration with Metaplex**: By utilizing Metaplex's Core Asset plugin architecture, we open up various possibilities for NFT utilization. This approach ensures compatibility with a wide range of existing Solana NFT infrastructure and marketplaces, while also enabling flexible extensions and customizations.

3. **Efficient Staking Mechanism**: We provide a platform where users can enjoy the benefits of DeFi, such as Solana's liquid staking and restaking, simply by playing the game, without needing to deeply understand these new technologies.

4. **Scalable Reward Distribution** (planned): We will implement a scalable reward distribution mechanism that can handle a large number of stakers without significant performance degradation. To achieve this, we plan to utilize Light Protocol's ZK Compressed Token mechanism, which will allow us to efficiently compress and store large amounts of reward data on-chain, enabling us to manage rewards for a vast number of participants while maintaining high performance and low costs.

5. **Composability with Other Solana Programs**: Our staking program is designed to be easily composable with other Solana programs, allowing for future expansions and integrations.

These technical features demonstrate our commitment to building a scalable, efficient, and secure staking and reward distribution system on Solana.

## Prerequisites

- Solana CLI 1.18.22+
- Anchor 0.30.1

## Build

You can build our staking program with the following commands:

```shell
npm install
anchor build
```

## Test

You can run local tests with the following commands:

```shell
# Execute local tests.
anchor test
```

### Note on current instructions

The current test program is designed to create an account and mint an NFT when a user deposits, update the account and NFT when additional staking occurs, and finally delete the account and burn the NFT when unstaking.

However, in the final version, the instructions for account deletion and NFT burning will be removed. Instead, basic functionalities such as token deposits and withdrawals will be implemented in each instruction.
