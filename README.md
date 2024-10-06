# Windfall

## Technology Used

### Portal

- Next.js, React, Tailwind CSS, shadcn/ui
- Portal is DB less architecture to work with game side easily

### Game

- Unity, AWS

### Solana Contracts

- Light Protocol (ZK Compression)
- MagicBlock Ephemeral Rollups
- Metaplex Core NFT
- Solana Actions & Blinks

## Ensuring Game Result Integrity

- This part is implemented in Unity and AWS side.

## Authentication and Authorization

### Authentication:

- **Telegram Authentication:** Authentication is done via initData sent by the Telegram Bot.

  - https://github.com/Windfall-dev/portal/blob/main/src/providers/TelegramProvider.tsx

- **Solana Wallet Authentication:** Sign In With Solana authentication is used.

  - https://github.com/Windfall-dev/portal/blob/main/src/providers/SolanaWalletProvider.tsx

### Authorization:

- After portal authentication, an access token is issued and passed to the Unity game. The Unity game sends this token in the Authorization header to the backend, which verifies the token to identify the user ID and store data.

![auth](./docs/auth.png)

## App Demo Play Instructions

### Preparation
1. Switch the wallet to Solana Devnet
2. Prepare a faucet with more than 0.01 SOL

### Launching Demo
1. Access URL (https://windfall-prototype.vercel.app/).
2. Press the Staking button.
3. Enter 0.01 and press the Deposit button (The depositable amount is fixed at 0.01 SOL).
4. Confirm that points and rankings have increased.
5. Press the Games button and play BEAT PET.
6. Confirm that points and rankings have changed based on the play results.
7. Press the ✕ button on the game title screen to return to the TOP page.
8. Press the Staking button, select the Withdraw tab from the Staking screen, enter 0.01, and withdraw SOL.

## Blinks Lottery Demo Play Instructions

### Preparation & play
1. Switch the wallet to Solana mainnet.
2. Turn on Solana Actions on X.com from Experimental Features.
3. Access X from this URL and press the Pull Now button to draw the lottery.

## Notable Features

### Telegram Bot

Our platform is also available as a Telegram mini app, providing users with seamless access.

### Programmable Wallet

To simplify onboarding for Telegram users, we utilize programmable wallets specifically for users authenticated via Telegram.

### Solana LST Integration

Integration is being tested using the Jupiter API, initially focusing on trading INT. In the main scenario, we plan to use own Samctum and Jito LST/LRT in the future.


## Solana Programs

Solana program prototypes are stored in separate subdirectories.
For now, we are focusing on verifying technical feasibility and are actively working on incorporating advanced technologies.

### Raffle

`raffle` program is located in the `programs/raffle` directory.
For details on how to build and run the program, please refer to [programs/raffle/README.md](programs/raffle/README.md).

Since our raffles are held daily, creating an account to store user lottery information each time would result in non-negligible account costs.
To address this, we utilize Light Protocol's ZK Compression to manage user information in compressed accounts.
Additionally, to accommodate large-scale users who may hold numerous lottery tickets, we have designed the lottery drawing process to be executable using MagicBlock's Ephemeral Rollups.
We aim to reduce costs through its gasless transactions.

### Staking

`staking` program is located in the `programs/staking` directory.
For more details, please see [programs/staking/README.md](programs/staking/README.md).

The deposit and withdrawal functionalities are not implemented yet.
Currently, we are verifying the process of minting a Metaplex Core NFT programmatically when a user creates an account at the start of staking.
We are also conducting experiments with Attribute plugin to dynamically add attributes to NFTs.

### Blinks

Solana Actions & Blinks implementation can be found in the `programs/blinks` directory.
Please refer to [programs/blinks/README.md](programs/blinks/README.md) for more information.

The Solana program in this directory is fundamentally similar to the raffle program, but it is designed in a gacha-style format.
By implementing Blinks, we aim to provide an easy way for users to participate in the lottery through X (formerly Twitter) posts and, in the future, other social media platforms.

