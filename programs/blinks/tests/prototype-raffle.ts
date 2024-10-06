import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { PrototypeRaffle } from "../target/types/prototype_raffle";
import { assert } from "chai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const KEYPAIR_PATH = process.env.KEYPAIR_PATH || "/root/.config/solana/id.json";

const loadKeypair = (path: string) => {
  const keypair = fs.readFileSync(path, "utf-8");
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(keypair)));
};

// keypair used to pay tx fee
const kp = loadKeypair(KEYPAIR_PATH);

// admin keypair
const adminKeyPair = anchor.web3.Keypair.generate();

const identifier = anchor.web3.Keypair.generate().publicKey;

const mintAuthority = anchor.web3.Keypair.generate();
const decimals = 9;
let mockTokenMint;
let raffleVault;

describe("prototype-raffle", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.PrototypeRaffle as Program<PrototypeRaffle>;

  const [rafflePDA, _raffleBump] = PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode('raffle'),
      identifier.toBuffer(),
      adminKeyPair.publicKey.toBuffer(),
    ],
    program.programId
  )

  before(async () => {
    // Create a mock token mint for testing
    mockTokenMint = await createMint(
      program.provider.connection,
      kp,
      mintAuthority.publicKey,
      null,
      decimals,
    );
    console.log("New token mint (mock wrapped SOL) created:", mockTokenMint.toString());

    // Mint the mock token
    raffleVault = await getOrCreateAssociatedTokenAccount(program.provider.connection, kp, mockTokenMint, rafflePDA, true);
    console.log("Associated token address [vault]:", raffleVault.address.toString());
    const mintTx = await mintTo(
      program.provider.connection,
      kp,
      mockTokenMint,
      raffleVault.address,
      mintAuthority,
      new anchor.BN(123_000_000_000).toNumber(),
    );
    console.log("Mint Transaction signature: ", mintTx);
  });

  it("new raffle", async () => {
    const nowBn = new anchor.BN(Date.now() / 1000);
    const startTs = nowBn.add(new anchor.BN(3));
    const endTs = nowBn.add(new anchor.BN(10));
    // const winningTicketsTotal = new anchor.BN(300);
    // const losingTicketsTotal = new anchor.BN(700);
    // const payoutPerWin = new anchor.BN(100_000_000);

    // Create an array of 4 u64 values for ticketsTotal
    const ticketsTotal = [
      new anchor.BN(10),
      new anchor.BN(50),
      new anchor.BN(150),
      new anchor.BN(290)
    ];
    const ticketPerUser = new anchor.BN(10);

    // Create a new raffle
    const newRaffleTx = await program.methods.newRaffle(
      startTs,
      endTs,
      ticketsTotal,
      // payoutPerWin,
      ticketPerUser,
      true,
    )
      .accounts({
        identifier,
        authority: adminKeyPair.publicKey,
        raffle: rafflePDA,
        payer: kp.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([kp, adminKeyPair])
      .rpc();
    console.log("Transaction signature: ", newRaffleTx);

    // Fetch the created Raffle account
    const raffleAccount = await program.account.raffle.fetch(rafflePDA);

    // Assert the contents of the Raffle account
    assert.ok(raffleAccount.identifier.equals(identifier), "Identifier pubkey should match");
    assert.ok(raffleAccount.authority.equals(adminKeyPair.publicKey), "Authority pubkey should match");
    assert.equal(raffleAccount.startTs.toNumber(), startTs.toNumber(), "Start timestamp should match");
    assert.equal(raffleAccount.endTs.toNumber(), endTs.toNumber(), "End timestamp should match");
    assert.equal(raffleAccount.ticketsRemaining[0].toNumber(), ticketsTotal[0].toNumber(), `r0 tickets should match: ${ticketsTotal[0].toNumber()}`);
    assert.equal(raffleAccount.ticketsRemaining[1].toNumber(), ticketsTotal[1].toNumber(), `r1 tickets should match: ${ticketsTotal[1].toNumber()}`);
    assert.equal(raffleAccount.ticketsRemaining[2].toNumber(), ticketsTotal[2].toNumber(), `r2 tickets should match: ${ticketsTotal[2].toNumber()}`);
    assert.equal(raffleAccount.ticketsRemaining[3].toNumber(), ticketsTotal[3].toNumber(), `r3 tickets should match: ${ticketsTotal[3].toNumber()}`);
    assert.equal(raffleAccount.ticketsMaxPerUser.toNumber(), ticketPerUser.toNumber(), `r3 tickets should match: ${ticketsTotal[3].toNumber()}`);
    assert.isAbove(raffleAccount.bump, 0, "canonical ");
    console.log("Raffle account bump = ", raffleAccount.bump);
    console.log("Raffle account successfully created and verified");
    // const newRaffleTx = await program.methods.newRaffle(
    //   startTs,
    //   endTs,
    //   winningTicketsTotal,
    //   losingTicketsTotal,
    //   payoutPerWin,
    //   true,
    // )
    //   .accounts({
    //     identifier,
    //     authority: adminKeyPair.publicKey,
    //     raffle: rafflePDA,
    //     mint: mockTokenMint,
    //     payer: kp.publicKey,
    //     systemProgram: anchor.web3.SystemProgram.programId,
    //   })
    //   .signers([kp, adminKeyPair])
    //   .rpc();
    // console.log("Transaction signature: ", newRaffleTx);

    // // Fetch the created Raffle account
    // const raffleAccount = await program.account.raffle.fetch(rafflePDA);

    // // Assert the contents of the Raffle account
    // assert.ok(raffleAccount.identifier.equals(identifier), "Identifier pubkey should match");
    // assert.ok(raffleAccount.authority.equals(adminKeyPair.publicKey), "Authority pubkey should match");
    // // assert.deepEqual(raffleAccount.merkleRoot, new Array(32).fill(0), "Root should be initialized to zero");
    // assert.ok(raffleAccount.mint.equals(mockTokenMint), "Mint pubkey should match");
    // assert.equal(raffleAccount.startTs.toNumber(), startTs.toNumber(), "Start timestamp should match");
    // assert.equal(raffleAccount.endTs.toNumber(), endTs.toNumber(), "End timestamp should match");
    // assert.equal(raffleAccount.winningTicketsTotal.toNumber(), winningTicketsTotal.toNumber(), `Total winning tickets should match: ${winningTicketsTotal.toNumber()}`);
    // assert.equal(raffleAccount.winningTicketsRemaining.toNumber(), winningTicketsTotal.toNumber(), `Remaining winning tickets should match: ${winningTicketsTotal.toNumber()}`);
    // assert.equal(raffleAccount.losingTicketsTotal.toNumber(), losingTicketsTotal.toNumber(), `Total losing tickets should match: ${losingTicketsTotal.toNumber()}`);
    // assert.equal(raffleAccount.losingTicketsRemaining.toNumber(), losingTicketsTotal.toNumber(), `Remaining losing tickets should match: ${losingTicketsTotal.toNumber()}`);
    // assert.equal(raffleAccount.payoutPerWin.toNumber(), payoutPerWin.toNumber(), "Payout per win should match");
    // assert.isAbove(raffleAccount.bump, 0, "canonical ");
    // console.log("Raffle account bump = ", raffleAccount.bump);
    // console.log("Raffle account successfully created and verified");
  });

  it("draw w/ token account", async () => {
    // // Fetch the token balance of the raffle vault
    // const raffleVaultBalance = await program.provider.connection.getTokenAccountBalance(raffleVault.address);
    // console.log("Raffle vault balance:", raffleVaultBalance.value.uiAmount);

    // // Assert that the balance is correct
    // assert.equal(raffleVaultBalance.value.uiAmount, 123, `Raffle vault should have ${123} tokens`);

    // const userTokenAccount = await getOrCreateAssociatedTokenAccount(program.provider.connection, kp, mockTokenMint, kp.publicKey);
    // console.log("Associated token address [user]:", userTokenAccount.address.toString());

    const [drawRecordPDA, _drawRecordBump] = PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode('raffle'),
        rafflePDA.toBuffer(),
        kp.publicKey.toBuffer(),
      ],
      program.programId
    )

    console.log("DrawRecord PDA:", drawRecordPDA.toString());

    const ticketsToDraw = new anchor.BN(1);
    // const ticketsToDraw = new anchor.BN(5);
    const drawTx = await program.methods.draw(
      ticketsToDraw
    )
      .accounts({
        raffle: rafflePDA,
        // mint: mockTokenMint,
        drawRecord: drawRecordPDA,
        // from: raffleVault.address,
        // to: userTokenAccount.address,
        userAuthority: kp.publicKey,
        payer: kp.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        // tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .signers([kp])
      .rpc();
    console.log("Transaction signature: ", drawTx);

    // Fetch the created Raffle account
    const drawRecordAccount = await program.account.drawRecord.fetch(drawRecordPDA);

    assert.ok(drawRecordAccount.userAuthority.equals(kp.publicKey), "User Authority pubkey should match");
    assert.ok(drawRecordAccount.raffle.equals(rafflePDA), "Raffle pubkey should match");
    assert.equal(drawRecordAccount.ticketsAllocated.toNumber(), ticketsToDraw.toNumber(), "tickets allocated should match");
    // assert.equal(drawRecordAccount.ticketsWon[0].toNumber(), 0, "r0 tickets drawn should match");
    // assert.equal(drawRecordAccount.ticketsWon[1].toNumber(), 0, "r1 tickets drawn should match");
    // assert.equal(drawRecordAccount.ticketsWon[2].toNumber(), 0, "r2 tickets drawn should match");
    // assert.equal(drawRecordAccount.ticketsWon[3].toNumber(), 0, "r3 tickets drawn should match");

    console.log(`draw record: ${drawRecordAccount.ticketsWon[0].toNumber()}, ${drawRecordAccount.ticketsWon[1].toNumber()}, ${drawRecordAccount.ticketsWon[2].toNumber()}, ${drawRecordAccount.ticketsWon[3].toNumber()}`)

    // assert.ok(drawRecordAccount.raffle.equals(rafflePDA), "Raffle pubkey should match");
    // assert.equal(drawRecordAccount.ticketsAllocated.toNumber(), ticketsToDraw.toNumber(), "tickets allocated should match");
    // assert.equal(drawRecordAccount.ticketsDrawn.toNumber(), ticketsToDraw.toNumber(), "tickets drawn should match");

    // const userTokenBalance = await program.provider.connection.getTokenAccountBalance(userTokenAccount.address);
    // console.log(`tickets allocated: ${drawRecordAccount.ticketsAllocated.toNumber()}, tickets drawn: ${drawRecordAccount.ticketsDrawn.toNumber()}`);
    // console.log(`tickets won: ${drawRecordAccount.ticketsWon.toNumber()}, user token balance: ${userTokenBalance.value.uiAmount}`);

    // // Assert that the balance is correct
    // const expectedBalance = drawRecordAccount.ticketsWon.toNumber() * 0.1;
    // const actualBalance = userTokenBalance.value.uiAmount;
    // const epsilon = 1e-6; // Small value to account for floating-point precision
    // assert(Math.abs(actualBalance - expectedBalance) < epsilon, `User token balance (${actualBalance}) should be approximately equal to ${expectedBalance} tokens`);

  });

  it("draw w/ token account [2]", async () => {
    // // Fetch the token balance of the raffle vault
    // const raffleVaultBalance = await program.provider.connection.getTokenAccountBalance(raffleVault.address);
    // console.log("Raffle vault balance:", raffleVaultBalance.value.uiAmount);

    // const userTokenAccount = await getOrCreateAssociatedTokenAccount(program.provider.connection, kp, mockTokenMint, kp.publicKey);
    // console.log("Associated token address [user]:", userTokenAccount.address.toString());

    const [drawRecordPDA, _drawRecordBump] = PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode('raffle'),
        rafflePDA.toBuffer(),
        kp.publicKey.toBuffer(),
      ],
      program.programId
    )

    console.log("DrawRecord PDA:", drawRecordPDA.toString());

    const ticketsToDraw = new anchor.BN(1);
    // const ticketsToDraw = new anchor.BN(5);
    const drawTx = await program.methods.draw(
      ticketsToDraw
    )
      .accounts({
        raffle: rafflePDA,
        // mint: mockTokenMint,
        drawRecord: drawRecordPDA,
        // from: raffleVault.address,
        // to: userTokenAccount.address,
        userAuthority: kp.publicKey,
        payer: kp.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        // tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .signers([kp])
      .rpc();
    console.log("Transaction signature: ", drawTx);

    // Fetch the created Raffle account
    const drawRecordAccount = await program.account.drawRecord.fetch(drawRecordPDA);

    assert.ok(drawRecordAccount.userAuthority.equals(kp.publicKey), "User Authority pubkey should match");
    assert.ok(drawRecordAccount.raffle.equals(rafflePDA), "Raffle pubkey should match");
    assert.equal(drawRecordAccount.ticketsAllocated.toNumber(), ticketsToDraw.toNumber() * 2, "tickets allocated should match");
    // assert.equal(drawRecordAccount.ticketsWon[0].toNumber(), 0, "r0 tickets drawn should match");
    // assert.equal(drawRecordAccount.ticketsWon[1].toNumber(), 0, "r1 tickets drawn should match");
    // assert.equal(drawRecordAccount.ticketsWon[2].toNumber(), 0, "r2 tickets drawn should match");
    // assert.equal(drawRecordAccount.ticketsWon[3].toNumber(), 0, "r3 tickets drawn should match");
    console.log(`draw record: ${drawRecordAccount.ticketsWon[0].toNumber()}, ${drawRecordAccount.ticketsWon[1].toNumber()}, ${drawRecordAccount.ticketsWon[2].toNumber()}, ${drawRecordAccount.ticketsWon[3].toNumber()}`)


    // assert.ok(drawRecordAccount.raffle.equals(rafflePDA), "Raffle pubkey should match");
    // assert.equal(drawRecordAccount.ticketsAllocated.toNumber(), ticketsToDraw.toNumber() * 2, "tickets allocated should match");
    // assert.equal(drawRecordAccount.ticketsDrawn.toNumber(), ticketsToDraw.toNumber() * 2, "tickets drawn should match");

    // const userTokenBalance = await program.provider.connection.getTokenAccountBalance(userTokenAccount.address);
    // console.log(`tickets allocated: ${drawRecordAccount.ticketsAllocated.toNumber()}, tickets drawn: ${drawRecordAccount.ticketsDrawn.toNumber()}`);
    // console.log(`tickets won: ${drawRecordAccount.ticketsWon.toNumber()}, user token balance: ${userTokenBalance.value.uiAmount}`);

    // // Assert that the balance is correct
    // const expectedBalance = drawRecordAccount.ticketsWon.toNumber() * 0.1;
    // const actualBalance = userTokenBalance.value.uiAmount;
    // const epsilon = 1e-6; // Small value to account for floating-point precision
    // assert(Math.abs(actualBalance - expectedBalance) < epsilon, `User token balance (${actualBalance}) should be approximately equal to ${expectedBalance} tokens`);
  });

  it("nop", async () => {
    const nopTx = await program.methods.nop(
    )
      .accounts({
        // raffle: rafflePDA,
        // payer: kp.publicKey,
      })
      .signers([kp])
      .rpc();
    console.log("Transaction signature: ", nopTx);
  });

  it("close", async () => {
    const closeTx = await program.methods.closeRaffle(
    )
      .accounts({
        authority: adminKeyPair.publicKey,
        raffle: rafflePDA,
        payer: kp.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([kp, adminKeyPair])
      .rpc();
    console.log("Transaction signature: ", closeTx);

    // Attempt to fetch the closed raffle account
    try {
      await program.account.raffle.fetch(rafflePDA);
      assert.fail("Raffle account should not exist after closing");
    } catch (error) {
      assert.equal(
        error.message,
        "Account does not exist or has no data " + rafflePDA.toBase58(),
        "Unexpected error message"
      );
    }
  });
});
