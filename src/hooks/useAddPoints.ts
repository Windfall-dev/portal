import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useState } from "react";

import { useAuth } from "./useAuth";

export interface RankingUserProps {
  rank: string;
  name: string;
  points: string;
}

export function useAddPoints() {
  const [user, setUser] = useState<RankingUserProps>({
    rank: "",
    name: "",
    points: "",
  });

  const context = useAuth();

  const handleAddPoints = async (signature: string, userToken: string) => {
    if (!signature) {
      throw new Error("Failed to retrieve signature");
    }

    if (!userToken) {
      throw new Error("User token is required to add points.");
    }

    const requestBody = {
      signature,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FAST_API_URL}/api/point/deposit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${context.accessToken}`,
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const new_point_balance = Math.floor(
          data.new_point_balance / LAMPORTS_PER_SOL,
        );
        setUser((prevUser) => ({
          ...prevUser,
          points: new_point_balance.toString(), // update points
        }));

        console.log(
          "Backend Return value is:",
          data.new_point_balance.toString(),
        );
        console.log("New Point Balance is: ", new_point_balance);
        return new_point_balance;
      } else if (response.status === 401) {
        const errorData = await response.json();
        console.error("Unauthorized:", errorData.message);
        throw new Error(errorData.message || "Unauthorized");
      } else {
        const errorData = await response.json();
        console.error("Error adding points:", errorData.message);
        throw new Error(errorData.message || "Failed to add points");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error in handlePointAdd:", error.message);
        throw new Error(error.message);
      } else {
        console.error("An unexpected error occurred in handlePointAdd.");
        throw new Error("An unexpected error occurred.");
      }
    }
  };
  return { user, setUser, handleAddPoints };
}
