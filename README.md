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

## Notable Features

### Telegram Bot

Our platform is also available as a Telegram mini app, providing users with seamless access.

### Programmable Wallet

To simplify onboarding for Telegram users, we utilize programmable wallets specifically for users authenticated via Telegram.

### Solana LST Integration

Integration is being tested using the Jupiter API, initially focusing on trading INT. In the main scenario, we plan to use own Samctum and Jito LST/LRT in the future.
