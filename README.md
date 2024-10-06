# Windfall

## Technology Used

### Portal

- Next.js, React, Tailwind CSS, shadcn/ui
- Portal is DB less architecture to work with game side easily

### Game

- Unity, AWS

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


## Notable Features

### Telegram Bot

Our platform is also available as a Telegram mini app, providing users with seamless access.

### Programmable Wallet

To simplify onboarding for Telegram users, we utilize programmable wallets specifically for users authenticated via Telegram.

### Solana LST Integration

Integration is being tested using the Jupiter API, initially focusing on trading INT. In the main scenario, we plan to use own Samctum and Jito LST/LRT in the future.
