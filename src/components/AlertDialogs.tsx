"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { handleDepositSol, handleWithdrawSol } from "@/utils/solana-handlers";

import Loading from "./Loading";
import PopupResultDeposit from "./PopupResultDeposit";

type DialogState = "none" | "confirm" | "loading" | "result" | "error";

const MAX_DEPOSIT_AMOUNT = 0.01;

interface AlertProp {
  buttonText: string;
  amount: string;
}

export interface RankingUserProps {
  rank: string;
  name: string;
  points: string;
}

export function AlertDialogs({ buttonText, amount }: AlertProp) {
  const [dialogState, setDialogState] = useState<DialogState>("none");
  const [user, setUser] = useState<RankingUserProps>({
    rank: "",
    name: "",
    points: "",
  });
  const context = useAuth();
  const userId = context.userId.slice(0, 4) + ".." + context.userId.slice(-4);
  console.log("UserId", userId, "Context", context);

  const handlePointAdd = async (deposit: number, userToken: string) => {
    if (!deposit || deposit <= 0) {
      throw new Error("Deposit amount must be a positive number.");
    }

    if (!userToken) {
      throw new Error("User token is required to add points.");
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FAST_API_URL}/api/point/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${context.accessToken}`,
          },
          body: JSON.stringify({
            deposit,
            token: userToken,
          }),
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

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_FAST_API_URL}/api/rankings`,
          {
            method: "GET",
          },
        );
        const data = await response.json();
        const user = data.rankings.find(
          (user: RankingUserProps) => user.name === userId,
        );
        console.log("User", user);
        setUser(user);
      } catch (error) {
        console.error("Error fetching rankings:", error);
      }
    };
    fetchRankings();
  }, [userId]);

  const {
    publicKey,
    sendTransaction: sendTransactionSolana,
    connected,
  } = useWallet();

  const handleButtonClick = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setDialogState("error");
      return;
    }
    setDialogState("confirm");
  };

  const handleTransaction = () => {
    if (!connected || !publicKey) {
      setDialogState("error");
      return;
    }
    setDialogState("loading");
    runTransaction();
  };

  const resetDialog = () => {
    setDialogState("none");
  };

  const runTransaction = async () => {
    try {
      if (buttonText === "Deposit") {
        await handleDepositSol(
          publicKey!,
          sendTransactionSolana,
          parseFloat(amount) > MAX_DEPOSIT_AMOUNT
            ? MAX_DEPOSIT_AMOUNT
            : parseFloat(amount),
        );
        await handlePointAdd(parseFloat(amount), context.userId);
      } else {
        await handleWithdrawSol(publicKey!, parseFloat(amount));
      }
      setDialogState("result");
    } catch (error) {
      setDialogState("error");
      console.error("Transaction failed", error);
    }
  };

  return (
    <div className="relative">
      {/* Button to start the process */}
      <Button variant="standard" className="w-full" onClick={handleButtonClick}>
        {buttonText}
      </Button>

      {/* Confirm Dialog */}
      {dialogState === "confirm" && (
        <AlertDialog open onOpenChange={() => setDialogState("none")}>
          <AlertDialogContent className="mx-auto w-[335px] rounded-2xl p-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-left">
                Are you sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="body text-left">
                {`You are about to ${buttonText.toLowerCase()} ${amount} SOL.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row items-center justify-end space-x-[10px]">
              <AlertDialogCancel onClick={() => setDialogState("none")}>
                Cancel
              </AlertDialogCancel>
              <Button onClick={handleTransaction}>Continue</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Loading Dialog */}
      {dialogState === "loading" && (
        <AlertDialog open onOpenChange={() => setDialogState("none")}>
          <AlertDialogContent
            style={{
              margin: "unset",
              padding: "unset",
              border: "unset",
              borderRadius: "12px",
            }}
          >
            <div className="flex flex-col items-center">
              <Loading />
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Result Dialog */}
      {dialogState === "result" && (
        <AlertDialog open onOpenChange={() => setDialogState("none")}>
          <AlertDialogContent
            style={{
              margin: "unset",
              padding: "unset",
              border: "unset",
              borderRadius: "12px",
            }}
          >
            <PopupResultDeposit resetDialog={resetDialog} user={user} />
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Error Dialog */}
      {dialogState === "error" && (
        <AlertDialog open onOpenChange={() => setDialogState("none")}>
          <AlertDialogContent className="mx-auto w-[335px] rounded-2xl p-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-left">
                Transaction Failed
              </AlertDialogTitle>
              <AlertDialogDescription className="body text-left">
                Please ensure all fields are valid and your wallet is connected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row items-center justify-end space-x-[10px]">
              <Button onClick={() => setDialogState("none")}>Close</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
