"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import React, { useState } from "react";

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
import { handleDepositSol, handleWithdrawSol } from "@/utils/solana-handlers";

import Loading from "./Loading";
import PopupResultDeposit from "./PopupResultDeposit";

type DialogState = "none" | "confirm" | "loading" | "result" | "error";

interface AlertProp {
  ButtonText: string;
  amount: string;
}

export function AlertDialogs({ ButtonText, amount }: AlertProp) {
  const [dialogState, setDialogState] = useState<DialogState>("none");

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
      if (ButtonText === "Deposit") {
        await handleDepositSol(
          publicKey!,
          sendTransactionSolana,
          parseFloat(amount) > 0.01 ? 0.01 : parseFloat(amount),
        );
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
        {ButtonText}
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
                {`You are about to ${ButtonText.toLowerCase()} ${amount} SOL.`}
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
            <PopupResultDeposit resetDialog={resetDialog} />
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
