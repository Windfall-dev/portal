"use client";

import { useState } from "react";

import { AuthContext } from "@/contexts/AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState("");
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  console.log("accessToken", accessToken);
  console.log("username", username);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken,
        username,
        setUsername,
        userId,
        setUserId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
