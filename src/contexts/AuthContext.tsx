import { createContext } from "react";

interface AuthContextProps {
  accessToken: string;
  setAccessToken(accessToken: string): void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined,
);
