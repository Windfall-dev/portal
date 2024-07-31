// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TelegramWebApp = any;

interface Window {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
}
