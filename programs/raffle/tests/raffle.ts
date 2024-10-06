import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AccountMeta, ComputeBudgetProgram, PublicKey, Transaction } from "@solana/web3.js";
import { createMint } from "@solana/spl-token";
import {
  DelegateAccounts,
  DELEGATION_PROGRAM_ID,
  GetCommitmentSignature,
  MAGIC_PROGRAM_ID,
  MAGIC_CONTEXT_ID,
} from "@magicblock-labs/ephemeral-rollups-sdk"; import { assert } from "chai";
import {
  bn,
  createRpc,
  defaultStaticAccountsStruct,
  defaultTestStateTreeAccounts,
  deriveAddress,
  getIndexOrAdd,
  hashToBn254FieldSizeBe,
  LightSystemProgram,
} from "@lightprotocol/stateless.js";
import { keccak_256 } from '@noble/hashes/sha3';
// @ts-ignore
import { Raffle } from "../target/types/raffle";
import dotenv from "dotenv";

dotenv.config();

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const isLocalnet = provider.connection.rpcEndpoint.includes('localhost');

const providerEphemeralRollup = new anchor.AnchorProvider(
  new anchor.web3.Connection("https://devnet.magicblock.app/", {
    wsEndpoint: "wss://devnet.magicblock.app/",
  }),
  anchor.Wallet.local(),
  {}
);

// Get the default wallet from Anchor
const wallet = anchor.workspace.Raffle.provider.wallet;

// Admin keypair
const adminKeyPair = anchor.web3.Keypair.generate();

// Identifier pubkey (arbitrary identifier)
const identifier = anchor.web3.Keypair.generate().publicKey;

// Reward token related
const mintAuthority = anchor.web3.Keypair.generate();
const decimals = 9;
let mockTokenMint;

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Hash the provided `bytes` with Keccak256 and ensure that the result fits in
 * the BN254 prime field by truncating the resulting hash to 31 bytes.
 *
 * @param bytes Input bytes
 *
 * @returns     Hash digest
 */
export function hashvToBn254FieldSizeBe(bytes: Uint8Array[]): Uint8Array {
  const hasher = keccak_256.create();
  for (const input of bytes) {
    hasher.update(input);
  }
  const hash = hasher.digest();
  hash[0] = 0;
  return hash;
}

export function deriveAddressSeedCustom(
  seeds: Uint8Array[],
  programId: PublicKey,
): Uint8Array {
  const combinedSeeds: Uint8Array[] = [programId.toBytes(), ...seeds];
  const hash = hashvToBn254FieldSizeBe(combinedSeeds);
  return hash;
}

describe("raffle", () => {

  const program = anchor.workspace.Raffle as Program<Raffle>;

  const [raffle, _raffleBump] = PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode('raffle'),
      identifier.toBuffer(),
      adminKeyPair.publicKey.toBuffer(),
    ],
    program.programId
  );

  const [userRecord, _userRecordBump] = PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode('raffle'),
      raffle.toBuffer(),
      wallet.publicKey.toBuffer(),
    ],
    program.programId
  );

  const rpc = createRpc();
  const systemKeys = defaultStaticAccountsStruct();
  const stateTreeKeys = defaultTestStateTreeAccounts();
  const remainingAccounts: PublicKey[] = [];
  const merkleTreePubkeyIndex = getIndexOrAdd(remainingAccounts, stateTreeKeys.merkleTree);
  const nullifierQueuePubkeyIndex = getIndexOrAdd(remainingAccounts, stateTreeKeys.nullifierQueue);
  const addressMerkleTreePubkeyIndex = getIndexOrAdd(remainingAccounts, stateTreeKeys.addressTree);
  const addressQueuePubkeyIndex = getIndexOrAdd(remainingAccounts, stateTreeKeys.addressQueue);

  const [cpiSigner, _] = PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode('cpi_authority'),
    ],
    program.programId
  );

  before(async () => {
    if (isLocalnet) {
      console.log(`Executing tests on localnet`);

      // Create a mock token mint for testing
      mockTokenMint = await createMint(
        program.provider.connection,
        wallet.payer,
        mintAuthority.publicKey,
        null,
        decimals,
      );
      console.log("Mock token mint created:", mockTokenMint.toString());
    } else {
      console.log(`Executing tests on devnet`);

      // Devnet USDC: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
      // Mainnet USDC: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
      mockTokenMint = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
      console.log("Using Devnet USDC as mock token mint:", mockTokenMint.toString());
    }
  });

  it("[raffle] new", async () => {
    const nowBn = new anchor.BN(Date.now() / 1000);
    const startTs = nowBn.add(new anchor.BN(3));
    const endTs = nowBn.add(new anchor.BN(10));

    // Create a new raffle
    const newRaffleTx = await program.methods.newRaffle(
      startTs,
      endTs,
      false,
      true,
    )
      .accounts({
        identifier,
        authority: adminKeyPair.publicKey,
        raffle,
        mint: mockTokenMint,
        payer: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([wallet.payer, adminKeyPair])
      .rpc();
    console.log("newRaffle tx: ", newRaffleTx);

    // Assert the contents of the Raffle account
    const raffleAccount = await program.account.raffle.fetch(raffle);
    assert.ok(raffleAccount.identifier.equals(identifier), "Identifier pubkey should match");
    assert.ok(raffleAccount.authority.equals(adminKeyPair.publicKey), "Authority pubkey should match");
    assert.equal(raffleAccount.startTs.toNumber(), startTs.toNumber(), "Start timestamp should match");
    assert.equal(raffleAccount.endTs.toNumber(), endTs.toNumber(), "End timestamp should match");
    assert.equal(raffleAccount.isActive, false, "isActive should match");
    assert.equal(raffleAccount.isPublic, true, "isPublic should match");
    assert.isAbove(raffleAccount.bump, 0, "Canonical bump should be greater than 0");
    console.log("Raffle account bump = ", raffleAccount.bump);
    console.log("Raffle account successfully created and verified");
  });

  it("[raffle] add_prize", async () => {
    const payouts = [new anchor.BN(1_000_000), new anchor.BN(100_000), new anchor.BN(10_000)];
    const tickets = [new anchor.BN(1), new anchor.BN(5), new anchor.BN(10)];

    {
      // Assert the contents of the Raffle account
      const raffleAccount = await program.account.raffle.fetch(raffle);

      for (let i = 0; i < 8; i++) {
        assert.equal(raffleAccount.prizes[i].payout.toNumber(), 0, `Prize ${i} payout should match`);
        assert.equal(raffleAccount.prizes[i].tickets.toNumber(), 0, `Prize ${i} tickets should match`);
      }
    }

    // Add prize 0
    const addPrizeToRaffleTx0 = await program.methods.addPrizeToRaffle(
      payouts[0],
      tickets[0],
    )
      .accounts({
        authority: adminKeyPair.publicKey,
        raffle,
        payer: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([wallet.payer, adminKeyPair])
      .rpc();
    console.log("addPrizeToRaffle tx0: ", addPrizeToRaffleTx0);

    {
      // Assert the contents of the Raffle account
      const raffleAccount = await program.account.raffle.fetch(raffle);

      assert.equal(raffleAccount.prizes[0].payout.toNumber(), payouts[0].toNumber(), `Prize ${0} payout should match`);
      assert.equal(raffleAccount.prizes[0].tickets.toNumber(), tickets[0].toNumber(), `Prize ${0} tickets should match`);
      for (let i = 1; i < 8; i++) {
        assert.equal(raffleAccount.prizes[i].payout.toNumber(), 0, `Prize ${i} payout should match`);
        assert.equal(raffleAccount.prizes[i].tickets.toNumber(), 0, `Prize ${i} tickets should match`);
      }
    }

    // Add prize 1
    const addPrizeToRaffleTx1 = await program.methods.addPrizeToRaffle(
      payouts[1],
      tickets[1],
    )
      .accounts({
        authority: adminKeyPair.publicKey,
        raffle,
        payer: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([wallet.payer, adminKeyPair])
      .rpc();
    console.log("addPrizeToRaffle tx1: ", addPrizeToRaffleTx1);

    {
      // Assert the contents of the Raffle account
      const raffleAccount = await program.account.raffle.fetch(raffle);

      assert.equal(raffleAccount.prizes[0].payout.toNumber(), payouts[0].toNumber(), `Prize ${0} payout should match`);
      assert.equal(raffleAccount.prizes[0].tickets.toNumber(), tickets[0].toNumber(), `Prize ${0} tickets should match`);
      assert.equal(raffleAccount.prizes[1].payout.toNumber(), payouts[1].toNumber(), `Prize ${1} payout should match`);
      assert.equal(raffleAccount.prizes[1].tickets.toNumber(), tickets[1].toNumber(), `Prize ${1} tickets should match`);
      for (let i = 2; i < 8; i++) {
        assert.equal(raffleAccount.prizes[i].payout.toNumber(), 0, `Prize ${i} payout should match`);
        assert.equal(raffleAccount.prizes[i].tickets.toNumber(), 0, `Prize ${i} tickets should match`);
      }
    }

    // Add prize 2
    const addPrizeToRaffleTx2 = await program.methods.addPrizeToRaffle(
      payouts[2],
      tickets[2],
    )
      .accounts({
        authority: adminKeyPair.publicKey,
        raffle,
        payer: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([wallet.payer, adminKeyPair])
      .rpc();
    console.log("addPrizeToRaffle tx2: ", addPrizeToRaffleTx2);

    {
      // Assert the contents of the Raffle account
      const raffleAccount = await program.account.raffle.fetch(raffle);

      assert.equal(raffleAccount.prizes[0].payout.toNumber(), payouts[0].toNumber(), `Prize ${0} payout should match`);
      assert.equal(raffleAccount.prizes[0].tickets.toNumber(), tickets[0].toNumber(), `Prize ${0} tickets should match`);
      assert.equal(raffleAccount.prizes[1].payout.toNumber(), payouts[1].toNumber(), `Prize ${1} payout should match`);
      assert.equal(raffleAccount.prizes[1].tickets.toNumber(), tickets[1].toNumber(), `Prize ${1} tickets should match`);
      assert.equal(raffleAccount.prizes[2].payout.toNumber(), payouts[2].toNumber(), `Prize ${1} payout should match`);
      assert.equal(raffleAccount.prizes[2].tickets.toNumber(), tickets[2].toNumber(), `Prize ${1} tickets should match`);
      for (let i = 3; i < 8; i++) {
        assert.equal(raffleAccount.prizes[i].payout.toNumber(), 0, `Prize ${i} payout should match`);
        assert.equal(raffleAccount.prizes[i].tickets.toNumber(), 0, `Prize ${i} tickets should match`);
      }
    }
  });

  it("[user] redeem", async () => {
    console.log("UserRecord PDA:", userRecord.toString());

    const ticketsAllocated = new anchor.BN(10);
    const redeemTx = await program.methods.redeem(
      ticketsAllocated
    )
      .accounts({
        raffle,
        userRecord,
        userAuthority: wallet.publicKey,
        payer: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([wallet.payer])
      .rpc();
    console.log("Transaction signature: ", redeemTx);

    // Fetch the created UserRecord account
    const userRecordAccount = await program.account.userRecord.fetch(userRecord);

    assert.ok(userRecordAccount.userAuthority.equals(wallet.publicKey), "User Authority pubkey should match");
    assert.ok(userRecordAccount.raffle.equals(raffle), "Raffle pubkey should match");
    assert.equal(userRecordAccount.ticketsAllocated.toNumber(), ticketsAllocated.toNumber(), "Tickets allocated should match");
    assert.equal(userRecordAccount.ticketsDrawn.toNumber(), 0, "Tickets drawn should be zero");
  });

  it("[user] draw", async () => {
    console.log("UserRecord PDA:", userRecord.toString());

    let ticketsPre = 0;
    {
      // Assert the contents of the Raffle account
      const raffleAccount = await program.account.raffle.fetch(raffle);
      for (let i = 0; i < 8; i++) {
        ticketsPre += raffleAccount.prizes[i].tickets.toNumber();
      }
    }

    const ticketsAllocated = new anchor.BN(10);
    const drawTx = await program.methods.draw(
      ticketsAllocated
    )
      .accounts({
        raffle,
        userRecord,
        userAuthority: wallet.publicKey,
        payer: wallet.publicKey,
      })
      .signers([wallet.payer])
      .rpc();
    console.log("Transaction signature: ", drawTx);

    let ticketsPost = 0;
    {
      // Assert the contents of the Raffle account
      const raffleAccount = await program.account.raffle.fetch(raffle);
      for (let i = 0; i < 8; i++) {
        ticketsPost += raffleAccount.prizes[i].tickets.toNumber();
      }
    }

    // Fetch the created UserRecord account
    const userRecordAccount = await program.account.userRecord.fetch(userRecord);

    assert.ok(userRecordAccount.userAuthority.equals(wallet.publicKey), "User Authority pubkey should match");
    assert.ok(userRecordAccount.raffle.equals(raffle), "Raffle pubkey should match");
    assert.equal(userRecordAccount.ticketsAllocated.toNumber(), ticketsAllocated.toNumber(), "Tickets allocated should match");
    assert.equal(userRecordAccount.ticketsDrawn.toNumber(), ticketsAllocated.toNumber(), "Tickets drawn should match");
    assert.equal(ticketsPre - ticketsAllocated.toNumber(), ticketsPost, "Number of remaining tickets should match");
  });

  it("[user] delegate", async () => {
    if (isLocalnet) {
      console.log('Skipping on localnet');
      return;
    }

    const accountInfo0 = await provider.connection.getAccountInfo(userRecord);
    if (accountInfo0.owner.toString() == DELEGATION_PROGRAM_ID) {
      console.log("UserRecord is already locked by the delegation program");
      return;
    }

    const {
      delegationPda,
      delegationMetadata,
      bufferPda,
    } = DelegateAccounts(userRecord, program.programId);

    // Delegate, Close PDA, and Lock PDA in a single instruction
    let tx = await program.methods
      .delegate(
        new anchor.BN(Date.now() / 1000 + 3600), // valid_until: current timestamp + 1 hour
        30000, // commit_ms: 30 seconds
      )
      .accounts({
        payer: provider.wallet.publicKey,
        userRecord,
        ownerProgram: program.programId,
        delegationMetadata: delegationMetadata,
        buffer: bufferPda,
        delegationRecord: delegationPda,
        delegationProgram: DELEGATION_PROGRAM_ID,
      })
      .transaction();
    tx.feePayer = provider.wallet.publicKey;
    tx.recentBlockhash = (
      await provider.connection.getLatestBlockhash()
    ).blockhash;
    tx = await providerEphemeralRollup.wallet.signTransaction(tx);
    const txSign = await provider.sendAndConfirm(tx, [], {
      skipPreflight: true,
      commitment: "finalized",
    });
    console.log("Delegate transaction signature:", txSign);

    await delay(5_000);
    console.log("Waited for 5 seconds after delegation");

    const accountInfo1 = await provider.connection.getAccountInfo(userRecord);
    console.log(`Account owner ${accountInfo1.owner.toString()}`);
    assert.ok(accountInfo1.owner.equals(new PublicKey(DELEGATION_PROGRAM_ID)), "Account must be delegated");
  });

  it("[user] undelegate", async () => {
    if (isLocalnet) {
      console.log('Skipping on localnet');
      return;
    }

    let tx = await program.methods
      .undelegate()
      .accounts({
        payer: providerEphemeralRollup.wallet.publicKey,
        userRecord,
        magicProgram: MAGIC_PROGRAM_ID,
        magicContext: MAGIC_CONTEXT_ID,
      })
      .transaction();
    tx.feePayer = provider.wallet.publicKey;
    tx.recentBlockhash = (
      await providerEphemeralRollup.connection.getLatestBlockhash()
    ).blockhash;
    tx = await providerEphemeralRollup.wallet.signTransaction(tx);

    const txSign = await providerEphemeralRollup.sendAndConfirm(tx);
    console.log("Undelegate transaction: ", txSign);

    // Await for the commitment on the base layer
    const txCommitSgn = await GetCommitmentSignature(
      txSign,
      providerEphemeralRollup.connection
    );
    console.log("Account commit signature:", txCommitSgn);
    const latestBlockhash = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction(
      {
        signature: txCommitSgn,
        ...latestBlockhash,
      },
      "confirmed"
    );

    await delay(5_000);
    console.log("Waited for 5 seconds after undelegation");

    const accountInfo1 = await provider.connection.getAccountInfo(userRecord);
    console.log(`Account owner ${accountInfo1.owner.toString()}`);
    assert.ok(accountInfo1.owner.equals(program.programId), "Account must be undelegated");
  });

  it("[user] compress", async () => {

    const seeds: Uint8Array[] = [
      new TextEncoder().encode('raffle'),
      raffle.toBuffer(),
      wallet.publicKey.toBuffer(),
    ];
    const addressSeed = deriveAddressSeedCustom(seeds, program.programId);
    const address = await deriveAddress(addressSeed, stateTreeKeys.addressTree);

    console.log(`derived address: ${address.toString()}`)

    const proof = await rpc.getValidityProof(
      [],
      [bn(address.toBytes())],
    );

    console.log(`proof.compressedProof = ${proof.compressedProof.a}, ${proof.compressedProof.b}, ${proof.compressedProof.c}`);
    console.log(`proof.roots (len ${proof.roots.length}) = ${proof.roots}`);
    console.log(`proof.leaves (len ${proof.leaves.length}) = ${proof.leaves}`);
    console.log(`rootIndices (len ${proof.rootIndices.length}) = ${proof.rootIndices}`);
    console.log(`leafIndices (len ${proof.leafIndices.length}) = ${proof.leafIndices}`);

    const remainingAccountMetas = remainingAccounts.map(
      (account): AccountMeta => ({
        pubkey: account,
        isWritable: true,
        isSigner: false,
      }),
    );

    const transaction = new Transaction();

    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 500_000,
    });
    transaction.add(modifyComputeUnits);

    const compressIx = await program.methods.compress(
      [],
      proof.compressedProof,
      {
        merkleTreePubkeyIndex,
        nullifierQueuePubkeyIndex,
        leafIndex: 0,
        queueIndex: null,
      },
      0,
      {
        addressMerkleTreePubkeyIndex,
        addressQueuePubkeyIndex,
      },
      proof.rootIndices[proof.rootIndices.length - 1],

    )
      .accounts({
        signer: wallet.signer,
        selfProgram: program.programId,
        cpiSigner,
        lightSystemProgram: LightSystemProgram.programId,
        systemProgram: anchor.web3.SystemProgram.programId,
        accountCompressionProgram: systemKeys.accountCompressionProgram,
        registeredProgramPda: systemKeys.registeredProgramPda,
        noopProgram: systemKeys.noopProgram,
        accountCompressionAuthority: systemKeys.accountCompressionAuthority,
        userRecord,
        raffle,
      })
      .remainingAccounts(remainingAccountMetas)
      .instruction();

    transaction.add(compressIx);

    transaction.feePayer = wallet.publicKey;

    transaction.recentBlockhash = (
      await rpc.getLatestBlockhash()
    ).blockhash;

    transaction.sign(wallet.payer);

    const signature = await rpc.sendRawTransaction(transaction.serialize());
    console.log("Transaction sent. Signature:", signature);

    await new Promise(resolve => setTimeout(resolve, 3000));

    const confirmation = await rpc.getSignatureStatuses([signature], { searchTransactionHistory: false });
    console.log(`confirmation: ${confirmation.value[0].confirmationStatus}`);

    const account = await rpc.getCompressedAccount(bn(address.toBytes()), undefined);
    console.log(`account=${account.address}, size=${account.data.data.length}, data=${Buffer.from(account.data.data).toString('hex')}`);

    // await new Promise(resolve => setTimeout(resolve, 5000));

    // {
    //   const accounts = await rpc.getCompressedAccountsByOwner(wallet.publicKey);
    //   if (accounts) {
    //     console.log(`# compressed accounts ${accounts.items.length}`);
    //     if (accounts.items.length > 0) {
    //       console.log(`compressed account 0: length=${accounts.items[0].data.data.length}, address=${accounts.items[0].address}`);
    //     }
    //   }  
    // }

    {
      // compressed accounts are owned by the program
      const accounts = await rpc.getCompressedAccountsByOwner(program.programId);
      if (accounts) {
        console.log(`# compressed accounts (owned) ${accounts.items.length}`);
        if (accounts.items.length > 0) {
          console.log(`compressed account 0 (owned): length=${accounts.items[0].data.data.length}, address=${new PublicKey(accounts.items[0].address)}`);
          console.log(`compressed account 0 (owned) data: ${Buffer.from(account.data.data).toString('hex')}`);
        }
      }  
    }

    // Verify that the Solana account with pubkey 'userRecord' does not exist
    // const userRecordAccountInfo = await rpc.getAccountInfo(userRecord);
    // assert.equal(userRecordAccountInfo, null, "UserRecord account should not exist");

    //     const a = program.coder.accounts.decodeUnchecked('UserRecord', account.data.data);
    // // Decode account.data to NameRecord
    // // console.log("UserRecord (compressed):", {
    // //   userAuthority: a.data.userAuthority.toBase58(),
    // //   raffle: a.data.raffle.toString(),
    // // });   
    // console.log("UserRecord (compressed):", {
    //   amount: a.amount.toNumber(),
    // });   
    // console.log(`userAuthority: ${wallet.publicKey}, raffle ${raffle.toString()}`);
    // await new Promise(resolve => setTimeout(resolve, 5000));

    // const accounts = await rpc.getCompressedAccountsByOwner(wallet.publicKey);
    // assert.equal(accounts.items.length, 1, `Compressed account count must be one`);
  });

  it("[user] decompress", async () => {

    const seeds: Uint8Array[] = [
      new TextEncoder().encode('raffle'),
      raffle.toBuffer(),
      wallet.publicKey.toBuffer(),
    ];
    const addressSeed = deriveAddressSeedCustom(seeds, program.programId);
    const address = await deriveAddress(addressSeed, stateTreeKeys.addressTree);

    console.log(`derived address: ${address.toString()}`)

    const compressedAccount = await rpc.getCompressedAccount(bn(address.toBytes()), undefined);

    console.log(`hash: ${compressedAccount.hash.toString()}`)

    const proof = await rpc.getValidityProof(
      [bn(compressedAccount.hash)],
      [],
    );

    console.log(`proof.compressedProof = ${proof.compressedProof.a}, ${proof.compressedProof.b}, ${proof.compressedProof.c}`);
    console.log(`proof.roots (len ${proof.roots.length}) = ${proof.roots}`);
    console.log(`proof.leaves (len ${proof.leaves.length}) = ${proof.leaves}`);
    console.log(`rootIndices (len ${proof.rootIndices.length}) = ${proof.rootIndices}`);
    console.log(`leafIndices (len ${proof.leafIndices.length}) = ${proof.leafIndices}`);
    console.log(`compressedAccount.leafIndex = ${compressedAccount.leafIndex}`);

    const remainingAccountMetas = remainingAccounts.map(
      (account): AccountMeta => ({
        pubkey: account,
        isWritable: true,
        isSigner: false,
      }),
    );

    const transaction = new Transaction();

    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 500_000,
    });
    transaction.add(modifyComputeUnits);

    const compressIx = await program.methods.decompress(
      [compressedAccount.data.data],
      proof.compressedProof,
      {
        merkleTreePubkeyIndex,
        nullifierQueuePubkeyIndex,
        leafIndex: compressedAccount.leafIndex,
        queueIndex: null,
      },
      proof.rootIndices[0],
      {
        addressMerkleTreePubkeyIndex,
        addressQueuePubkeyIndex,
      },
      0,
    )
      .accounts({
        signer: wallet.signer,
        selfProgram: program.programId,
        cpiSigner,
        lightSystemProgram: LightSystemProgram.programId,
        systemProgram: anchor.web3.SystemProgram.programId,
        accountCompressionProgram: systemKeys.accountCompressionProgram,
        registeredProgramPda: systemKeys.registeredProgramPda,
        noopProgram: systemKeys.noopProgram,
        accountCompressionAuthority: systemKeys.accountCompressionAuthority,
        userRecord,
        raffle,
      })
      .remainingAccounts(remainingAccountMetas)
      .instruction();

    transaction.add(compressIx);

    // set the end user as the fee payer
    transaction.feePayer = wallet.publicKey;

    transaction.recentBlockhash = (
      await rpc.getLatestBlockhash()
    ).blockhash;

    transaction.sign(wallet.payer);

    const signature = await rpc.sendRawTransaction(transaction.serialize());
    console.log("Transaction sent. Signature:", signature);

    await new Promise(resolve => setTimeout(resolve, 3000));

    const confirmation = await rpc.getSignatureStatuses([signature], { searchTransactionHistory: false });
    console.log(`confirmation: ${confirmation.value[0].confirmationStatus}`);
    
    const userRecordAccount = await program.account.userRecord.fetch(userRecord);

    console.log(`userAuthority field: ${userRecordAccount.userAuthority.toString()} vs wallet.publicKey: ${wallet.publicKey}`)
    console.log(`raffle field: ${userRecordAccount.raffle.toString()} vs raffle: ${raffle.toString()}`)

    assert.ok(userRecordAccount.userAuthority.equals(wallet.publicKey), "User Authority pubkey should match");
    assert.ok(userRecordAccount.raffle.equals(raffle), "Raffle pubkey should match");

    const accounts = await rpc.getCompressedAccountsByOwner(program.programId);
    assert.equal(accounts.items.length, 0, `Compressed account count must be zero`);
  });

  it("[raffle] close", async () => {
    const closeTx = await program.methods.closeRaffle(
    )
      .accounts({
        authority: adminKeyPair.publicKey,
        raffle,
        payer: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([wallet.payer, adminKeyPair])
      .rpc();
    console.log("Transaction signature: ", closeTx);

    // Attempt to fetch the closed raffle account
    try {
      await program.account.raffle.fetch(raffle);
      assert.fail("Raffle account should not exist after closing");
    } catch (error) {
      assert.equal(
        error.message,
        "Account does not exist or has no data " + raffle.toBase58(),
        "Unexpected error message"
      );
    }
  });
});
