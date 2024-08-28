export const handleLogin = (provider: string, credential: string) => {
  if (provider === "telegram") {
    handleTelegramLogin(credential);
  } else if (provider === "wallet") {
    handleWalletLogin(credential);
  } else {
    throw new Error("Unknown provider");
  }
};

// Dummy functions for different providers
const handleTelegramLogin = (credential: string) => {
  // Implement your logic here
  console.log(`Handling Telegram login with credential: ${credential}`);
};

const handleWalletLogin = (credential: string) => {
  // Implement your logic here
  console.log(`Handling Wallet login with credential: ${credential}`);
};
