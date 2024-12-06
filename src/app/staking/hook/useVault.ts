import * as anchor from "@coral-xyz/anchor";
import {
  NATIVE_MINT,
  createAssociatedTokenAccountInstruction,
  createCloseAccountInstruction,
  createSyncNativeInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { DialogState } from "../components/Popup";
import { useVaultContext } from "../context/VaultContext";
import { getMint, getVaultType, setupProgram } from "../utils/vaultUtils";

interface VaultProp {
  amount: string;
  setDialogState: Dispatch<SetStateAction<DialogState>>;
}

export function useVault({ amount, setDialogState }: VaultProp) {
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const { connected, publicKey, sendTransaction } = useWallet();
  const wallet = useAnchorWallet();
  const { selectedVault } = useVaultContext();
  const amountPerDecimal = Number(amount) * selectedVault.decimals;

  // vault に預けられているトークン数量を decimal と関係なく整数値のままで取得
  const getBalance = async (): Promise<number> => {
    if (!connected || !publicKey) {
      setTokenBalance("0");
      return 0;
    }

    try {
      const walletPubkey = new PublicKey(publicKey);
      const vaultType = getVaultType(selectedVault);
      const { program } = setupProgram(wallet);

      const [vault] = PublicKey.findProgramAddressSync(
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, publicKey]);

  const handleDeposit = async () => {
    if (!connected || !publicKey || !amount) return;

    setDialogState("loading");
    try {
      const { connection, program } = setupProgram(wallet);
      const vaultType = getVaultType(selectedVault);
      const [vault] = PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("vault"),
          vaultType.toBuffer(),
          publicKey.toBuffer(),
        ],
        program.programId,
      );

      const vaultTypeAccount = await program.account.vaultType.fetch(vaultType);
      const mint = getMint(selectedVault);

      const transaction = new Transaction();
      try {
        await program.account.vault.fetch(vault);
      } catch (error) {
        // create vault if necessary
        const newVaultIx = await program.methods
          .newVault()
          .accountsStrict({
            vault,
            vaultType,
            userAuthority: publicKey,
            payer: publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .instruction();

        transaction.add(newVaultIx);
      }

      // Get ATA address
      const ata = await getAssociatedTokenAddressSync(mint, publicKey);

      console.log(
        `wallet ${publicKey.toString()}, vault ${vault.toString()}, ata ${ata.toString()}`,
      );

      // wrapped SOL の場合は ATA の存在をチェックし、ATA がなければ作成した上で SOL をラップ。
      // それ以外のトークンミントの場合は ATA が存在して、デポジット数量以上のトークンの存在を確認するべきだが、
      // このサンプルではそこまで丁寧な処理はせず、TX を実行して何かがダメなら　TX がエラーになるだけ。
      // 基本的にデポジットするのだから、ATA が存在して、そこにはトークンがあるはず。
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
            lamports: Number(amountPerDecimal),
          }),
          createSyncNativeInstruction(ata),
        );
      }

      // deposit to vault
      const depositIx = await program.methods
        .deposit(new anchor.BN(amountPerDecimal))
        .accountsStrict({
          vault,
          vaultType,
          userAuthority: publicKey,
          mint,
          pool: vaultTypeAccount.pool,
          from: ata,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .instruction();
      transaction.add(depositIx);

      // wrapped SOL の場合は ATA を閉じる IX を追加
      if (wrapped) {
        transaction.add(
          createCloseAccountInstruction(ata, publicKey, publicKey),
        );
      }
      const prevBalance = await getBalance();
      const signature = await sendTransaction(transaction, connection);

      // 残高を更新 (最大30秒間、1秒ごとに更新)
      for (let i = 0; i < 30; i++) {
        const currentBalance = await getBalance();
        console.log(
          "currentBalance: ",
          tokenBalance,
          "prevBalance: ",
          prevBalance,
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (Number(currentBalance) > Number(prevBalance)) {
          return signature;
        }
      }
    } catch (error) {
      console.error("Deposit failed:", error);
      setDialogState("error");
    }
  };

  const handleWithdraw = async () => {
    if (!connected || !publicKey || !amount) return;

    setDialogState("loading");
    try {
      const { connection, program } = setupProgram(wallet);
      const vaultType = getVaultType(selectedVault);
      const [vault] = PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("vault"),
          vaultType.toBuffer(),
          publicKey.toBuffer(),
        ],
        program.programId,
      );

      const vaultTypeAccount = await program.account.vaultType.fetch(vaultType);
      const vaultAccount = await program.account.vault.fetch(vault);
      const mint = getMint(selectedVault);

      const transaction = new Transaction();

      const ata = await getAssociatedTokenAddressSync(mint, publicKey);

      console.log(
        `wallet ${publicKey.toString()}, vault ${vault.toString()}, ata ${ata.toString()}`,
      );

      // ATA が存在するか確認して、なければ作成する IX 追加
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
          .accountsStrict({
            vault,
            vaultType,
            userAuthority: publicKey,
          })
          .instruction();

        transaction.add(deactivateIx);
      }

      // 実運用が始まると、vault をいったん deactivating にして、次のシーズンまで待つ必要があるが、
      // いまの devnet の vault_type の設定では、即時に inactive にできるので、
      // 続けて withdraw を行うことができる。
      const amountBn = new anchor.BN(amountPerDecimal);

      // withdraw from vault
      const withdrawIx = await program.methods
        .withdraw(amountBn)
        .accountsStrict({
          vault,
          vaultType,
          userAuthority: publicKey,
          mint,
          pool: vaultTypeAccount.pool,
          reserve: vaultTypeAccount.reserve,
          to: ata,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .instruction();

      transaction.add(withdrawIx);

      if (created && mint.equals(NATIVE_MINT)) {
        transaction.add(
          createCloseAccountInstruction(ata, publicKey, publicKey),
        );
      }

      await getBalance();
      const prevBalance = Number(tokenBalance);
      const signature = await sendTransaction(transaction, connection);

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

  return {
    tokenBalance,
    getBalance,
    handleDeposit,
    handleWithdraw,
  };
}
