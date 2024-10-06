# Prototype Raffle Program and Blinks

This repository contains a prototype Raffle program built on the Solana blockchain as well as the implementation of corresponding Blinks.
The program allows users to create and participate in raffles, as well as draw tickets to win prizes.

## Overview

The Prototype Raffle Program is designed to demonstrate the following functionalities:
- Creating new raffles
- Drawing tickets from existing raffles

Additionally, this repository includes an implementation of Solana Blinks API endpoints.
Users can participate in raffles directly from Blinks embedded in X (formerly Twitter) posts,
by using Solana wallets which support unfurling Blinks.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Rust](https://www.rust-lang.org/tools/install) (latest stable version)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) (v1.18.0 or later)
- [Anchor](https://www.anchor-lang.com/docs/installation) (0.29.0)
- [Node.js](https://nodejs.org/) (v14 or later)
- [Yarn](https://yarnpkg.com/getting-started/install) or [npm](https://www.npmjs.com/get-npm)

## Building the Program

1. Build the Solana program:
   ```shell
   anchor build
   ```

2. Deploy the program to your desired Solana cluster (localnet, devnet, or mainnet-beta):
   ```shell
   anchor deploy
   ```

## Running Tests

To run the test suite:

```shell
anchor test
```