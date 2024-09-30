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

  const handleAddPoints = async (deposit: number, userToken: string) => {
    if (!deposit || deposit <= 0) {
      throw new Error("Deposit amount must be a positive number.");
    }

    if (!userToken) {
      throw new Error("User token is required to add points.");
    }

    const requestBody = {
      deposit,
      token: userToken,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FAST_API_URL}/api/point/add`,
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
        setUser((prevUser) => ({
          ...prevUser,
          points: data.new_point_balance.toString(), // update points
        }));

        return data;
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
