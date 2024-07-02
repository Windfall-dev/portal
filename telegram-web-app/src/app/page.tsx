"use client";

import { useEffect, useState } from "react";

interface User {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export default function Home() {
  const [tgWebApp, setTgWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tgWebApp = window.Telegram.WebApp;
      setTgWebApp(tgWebApp);
      tgWebApp.ready();

      fetch("/api/validate-telegram-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ initData: tgWebApp.initData }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.valid) {
            setUser(data.user);
          } else {
            setError("Invalid Telegram WebApp data");
          }
        })
        .catch((error) => {
          console.error("Error validating Telegram WebApp data:", error);
          setError("Error validating Telegram WebApp data");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
      setError("Telegram WebApp is not available");
    }
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!tgWebApp) {
    return <div>Telegram WebApp is not available</div>;
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Telegram WebApp Home</h1>
      {user ? (
        <div>
          <p>Welcome, {user.first_name}!</p>
          <p>Your Telegram ID: {user.id}</p>
          {user.username && <p>Username: @{user.username}</p>}
        </div>
      ) : (
        <p>User data not available</p>
      )}
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => tgWebApp.showAlert("Hello from WebApp!")}
      >
        Show Alert
      </button>
    </main>
  );
}
