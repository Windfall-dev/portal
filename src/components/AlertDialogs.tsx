"use client";

import { AnchorProvider, Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import {
  NATIVE_MINT,
  createAssociatedTokenAccountInstruction,
  createCloseAccountInstruction,
  createSyncNativeInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
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
import { RankingUserProps, useAddPoints } from "@/hooks/useAddPoints";
import { useAuth } from "@/hooks/useAuth";

// import { useTransaction } from "@/hooks/useTransaction";
import { Vault } from "../hooks/vault";
import idl from "../hooks/vault.json";
import Loading from "./Loading";
import PopupResultDeposit from "./PopupResultDeposit";

type DialogState =
  | "none"
  | "confirm"
  | "loading"
  | "depositResult"
  | "withdrawResult"
  | "error";

interface AlertProp {
  actionType: "deposit" | "withdraw";
  amount: string;
}

// Using `idl_object` avoids these type mismatch errors.
const idl_string = JSON.stringify(idl);
const idl_object = JSON.parse(idl_string);

function getConnection() {
  return new Connection("https://api.devnet.solana.com");
}

function getVaultType() {
  return new PublicKey("AS2UQURPKTpjiyV5eSTQwRtCns2Lya3sgUKLfSCca8q8");
}

function getMint() {
  return new PublicKey(NATIVE_MINT);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setupProgram(wallet: any) {
  const connection = getConnection();
  const provider = new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions(),
  );
  anchor.setProvider(provider);

  const program = new Program<Vault>(idl_object, provider);

  return { connection, provider, program };
}

export function AlertDialogs({ actionType, amount }: AlertProp) {
  const [dialogState, setDialogState] = useState<DialogState>("none");
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  // const [isLoading, setIsLoading] = useState(false);
  const { connected, publicKey, sendTransaction, wallet } = useWallet();

  const context = useAuth();
  const { handleAddPoints, user, setUser } = useAddPoints();

  // vault に預けられているトークン数量を decimal と関係なく整数値のままで取得
  const getBalance = async (): Promise<number> => {
    if (!connected || !publicKey) {
      setTokenBalance("0");
      return 0;
    }

    try {
      const walletPubkey = new PublicKey(publicKey);
      const vaultType = getVaultType();
      const { program } = setupProgram(wallet);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [vault, _] = PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("vault"),
          vaultType.toBuffer(),
          walletPubkey.toBuffer(),
        ],
        program.programId,
      );
      try {
        const vaultAccount = await program.account.vault.fetch(vault);
        const balance = vaultAccount.amount.toNumber();
        setTokenBalance(balance.toString());
        return balance;
      } catch (error) {
        setTokenBalance("0");
        return 0;
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      setTokenBalance("Error");
      return 0;
    }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      await getBalance();
    };
    fetchBalance();
    // setDepositAmount(Number(amount));
  }, [connected, publicKey, amount]);

  const handleDeposit = async () => {
    if (!connected || !publicKey || !amount) return;

    setDialogState("loading");
    try {
      const { connection, program } = setupProgram(wallet);
      const vaultType = getVaultType();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [vault, _] = PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("vault"),
          vaultType.toBuffer(),
          publicKey.toBuffer(),
        ],
        program.programId,
      );

      const vaultTypeAccount = await program.account.vaultType.fetch(vaultType);
      const mint = getMint();

      const transaction = new Transaction();
      try {
        await program.account.vault.fetch(vault);
      } catch (error) {
        // create vault if necessary
        const newVaultIx = await program.methods
          .newVault()
          .accounts({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            vault,
            vaultType,
            owner: publicKey,
            payer: publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .instruction();

        transaction.add(newVaultIx);
      }

      // Get or create ATA
      const ata = await getAssociatedTokenAddress(mint, publicKey);

      console.log(
        `wallet ${publicKey.toString()}, vault ${vault.toString()}, ata ${ata.toString()}`,
      );

      // wrapped SOL の場合は ATA の存在をチェックし、ATA がなければ作成した上で SOL をラップ。
      // それ以外のトークンミントの場合は ATA が存在して、デポジット数量以上のトークンの存在を確認するべきだが、
      // このサンプルではそこまで丁寧な処理はせず、TX を実行して何かがダメなら　TX がエラーになるだけ。
      let wrapped = false;
      if (mint.equals(NATIVE_MINT)) {
        const account = await connection.getAccountInfo(ata);
        if (!account) {
          wrapped = true;
          transaction.add(
            createAssociatedTokenAccountInstruction(
              publicKey,
              ata,
              publicKey,
              mint,
            ),
          );
        }

        // Add instruction to transfer SOL and sync wrapped SOL
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: ata,
            lamports: Number(amount),
          }),
          createSyncNativeInstruction(ata),
        );
      }

      // deposit to vault
      const depositIx = await program.methods
        .deposit(new anchor.BN(amount))
        .accounts({
          vault,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error          vaultType,
          owner: publicKey,
          payer: publicKey,
          pool: vaultTypeAccount.pool,
          from: ata,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .instruction();
      transaction.add(depositIx);

      if (wrapped) {
        transaction.add(
          createCloseAccountInstruction(ata, publicKey, publicKey),
        );
      }

      const signature = await sendTransaction(transaction, connection);

      // 残高を更新 (最大20秒間、1秒ごとに更新)
      for (let i = 0; i < 20; i++) {
        await getBalance();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (Number(tokenBalance) >= Number(amount)) {
          return signature;
        }
      }
    } catch (error) {
      console.error("Deposit failed:", error);
      alert("入金に失敗しました");
    }
  };

  const handleWithdraw = async () => {
    if (!connected || !publicKey || !amount) return;

    setDialogState("loading");
    try {
      const { connection, program } = setupProgram(wallet);
      const vaultType = getVaultType();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [vault, _] = PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("vault"),
          vaultType.toBuffer(),
          publicKey.toBuffer(),
        ],
        program.programId,
      );

      const vaultTypeAccount = await program.account.vaultType.fetch(vaultType);
      const vaultAccount = await program.account.vault.fetch(vault);
      const mint = getMint();

      const transaction = new Transaction();

      const ata = await getAssociatedTokenAddress(mint, publicKey);

      console.log(
        `wallet ${publicKey.toString()}, vault ${vault.toString()}, ata ${ata.toString()}`,
      );

      // ATA が存在するか確認して、なければ作成
      let created = false;
      const account = await connection.getAccountInfo(ata);
      if (!account) {
        created = true;
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            ata,
            publicKey,
            mint,
          ),
        );
      }

      if (vaultAccount.status.active) {
        // deactivate the vault
        const deactivateIx = await program.methods
          .deactivate()
          .accounts({
            vault,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error            vaultType,
            owner: publicKey,
            payer: publicKey,
          })
          .instruction();

        transaction.add(deactivateIx);
      }

      const amountBn = new anchor.BN(amount);

      // withdraw from vault
      const withdrawIx = await program.methods
        .withdraw(amountBn)
        .accounts({
          vault,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error          vaultType,
          owner: publicKey,
          payer: publicKey,
          pool: vaultTypeAccount.pool,
          to: ata,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .instruction();

      transaction.add(withdrawIx);

      if (created && mint.equals(NATIVE_MINT)) {
        transaction.add(
          createCloseAccountInstruction(ata, publicKey, publicKey),
        );
      }

      const signature = await sendTransaction(transaction, connection);
      const prevBalance = Number(tokenBalance);

      // 残高を更新 (最大20秒間、1秒ごとに更新)
      for (let i = 0; i < 20; i++) {
        const currentBalance = await getBalance();
        console.log(
          "currentBalance",
          currentBalance,
          "prevBalance",
          prevBalance,
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (prevBalance > currentBalance) {
          return signature;
        }
      }
    } catch (error) {
      console.error("Withdrawal failed:", error);
    }
  };

  const userId = context.userId.slice(0, 4) + ".." + context.userId.slice(-4);

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
        setUser(user);
      } catch (error) {
        console.error("Error fetching rankings:", error);
      }
    };
    fetchRankings();
  }, [userId, setUser]);

  const handleButtonClick = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setDialogState("error");
      return;
    }
    setDialogState("confirm");
  };

  const handleTransaction = async () => {
    setDialogState("loading");

    try {
      await runTransaction();
      setDialogState(
        actionType === "deposit" ? "depositResult" : "withdrawResult",
      );
    } catch (error) {
      console.error(error);
      setDialogState("error");
    }
  };

  const runTransaction = async (): Promise<string | undefined> => {
    if (actionType === "deposit") {
      // const sendAmount =
      //   lamportAmount > MAX_DEPOSIT_AMOUNT ? MAX_DEPOSIT_AMOUNT : lamportAmount;

      // if (walletAddress != "") {
      //   signature = await depositTelegram();
      // } else {
      //   if (!publicKey || !sendTransaction) {
      //     throw new Error("Wallet is not connected.");
      //   }
      //   signature = await depositSolana(publicKey, sendTransaction, sendAmount);
      // }

      const signature = handleDeposit();
      if (!signature) {
        throw new Error("Deposit transaction failed.");
      }

      await handleAddPoints(parseFloat(amount), context.userId);
      return signature;
    } else {
      console.log("withdraw is being processed.");
      const signature = await handleWithdraw();
      if (!signature) {
        throw new Error("Withdraw transaction failed.");
      }
      return signature;
      //   let signature: string | undefined;
      //   if (walletAddress != "") {
      //     console.log("WithdrawTelegram Called");
      //     signature = await withdrawTelegram();
      //   } else {
      //     if (!publicKey || !sendTransaction) {
      //       throw new Error("Wallet is not connected.");
      //     }
      //     signature = await withdrawSolana(publicKey, lamportAmount);
      //   }
      //   if (!signature) {
      //     throw new Error("Withdraw transaction failed.");
      //   }
      //   return signature;
    }
  };

  const resetDialog = () => {
    setDialogState("none");
  };

  return (
    <div className="relative">
      {/* Button to start the process */}
      <Button variant="standard" className="w-full" onClick={handleButtonClick}>
        {actionType}
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
                {`You are about to ${actionType} ${amount} SOL.`}
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
      {dialogState === "loading" && <Loading />}

      {/* DepositResult Dialog */}
      {dialogState === "depositResult" && (
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

      {/* WithdrawResult Dialog */}
      {dialogState === "withdrawResult" && (
        <AlertDialog open onOpenChange={() => setDialogState("none")}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-center">
                Withdrawal has been completed.
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex w-full flex-row items-center">
              <Button
                size="M"
                onClick={() => setDialogState("none")}
                className="w-full"
              >
                OK
              </Button>
            </AlertDialogFooter>
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
