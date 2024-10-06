import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Staking } from "../target/types/staking";
import { PublicKey } from "@solana/web3.js";
import { assert } from "chai";
import { fetchAssetsByOwner, fetchAssetV1, MPL_CORE_PROGRAM_ID } from "@metaplex-foundation/mpl-core";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { publicKey } from '@metaplex-foundation/umi';

describe("staking", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Staking as Program<Staking>;

  const umi = createUmi(program.provider.connection.rpcEndpoint, 'confirmed');

  const kp = anchor.web3.Keypair.generate();

  const vaultKp = anchor.web3.Keypair.generate();
  const vault = vaultKp.publicKey;

  const [userInfo, _userInfoBump] = PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode('staking'),
      vault.toBuffer(),
      kp.publicKey.toBuffer(),
    ],
    program.programId
  );

  const [authority, _authorityBump] = PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode('authority'),
    ],
    program.programId
  );

  const assetKp = anchor.web3.Keypair.generate();
  const asset = assetKp.publicKey;
  const stakeAmount = new anchor.BN(1_000_000);

  before(async () => {
    // Airdrop 1 SOL to the generated keypair
    const airdropSignature = await program.provider.connection.requestAirdrop(
      kp.publicKey,
      1 * anchor.web3.LAMPORTS_PER_SOL
    );

    await program.provider.connection.getSignatureStatuses([airdropSignature]);
    console.log(`Airdropped 1 SOL to ${kp.publicKey.toBase58()}`);

    await new Promise(resolve => setTimeout(resolve, 3000));
  });

  it("new_user_info", async () => {

    console.log(`userInfo: ${userInfo.toString()}`);
    console.log(`asset: ${asset.toString()}`);
    console.log(`authority: ${authority.toString()}`);

    const tx = await program.methods.newUserInfo(
      stakeAmount,
    ).accounts({
      // @ts-ignore
      userInfo,
      asset,
      coreProgram: MPL_CORE_PROGRAM_ID,
      owner: kp.publicKey,
      vault,
      authority,
      payer: kp.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
      .signers([kp, assetKp])
      .rpc();
    console.log("Your transaction signature", tx);

    // Assert the contents of the Raffle account
    const userInfoAccount = await program.account.userInfo.fetch(userInfo);
    assert.ok(userInfoAccount.owner.equals(kp.publicKey), "Owner pubkey should match");
    assert.equal(userInfoAccount.stakeAmount.toNumber(), stakeAmount.toNumber(), `stakeAmount should match`);
    console.log("UserInfo account bump = ", userInfoAccount.bump);
    console.log("UserInfo account successfully created and verified");

    // Fetch the Solana account info for kp.publicKey
    const accountInfo = await program.provider.connection.getAccountInfo(asset);

    // Check if the account exists
    if (accountInfo === null) {
      console.log(`Account ${asset.toBase58()} does not exist`);
    } else {
      console.log(`Account ${asset.toBase58()} exists`);
      console.log(`Account balance: ${accountInfo.lamports / anchor.web3.LAMPORTS_PER_SOL} SOL`);
      console.log(`Account owner: ${accountInfo.owner.toBase58()}`);
      console.log(`Account data length: ${accountInfo.data.length} bytes`);
    }

    // Assert that the account exists
    assert.notEqual(accountInfo, null, `Account ${asset.toBase58()} should exist`);

    // check core asset count
    const assets = await fetchAssetsByOwner(umi, publicKey(kp.publicKey.toString()));
    assert.equal(assets.length, 1, "number of assets should match");

    // check core asset
    const assetAccount = await fetchAssetV1(umi, publicKey(asset.toString()));
    assert.equal(assetAccount.name, "Windfall PFP", "NFT name should match");
    assert.equal(assetAccount.uri, "https://api.softgate.co.jp/api/pfp/1", "NFT URI should match");
  });

  it("stake", async () => {

    const tx = await program.methods.stake(
      stakeAmount,
    ).accounts({
      // @ts-ignore
      userInfo,
      asset,
      coreProgram: MPL_CORE_PROGRAM_ID,
      owner: kp.publicKey,
      vault,
      authority,
      payer: kp.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
      .signers([kp])
      .rpc();
    console.log("Your transaction signature", tx);

    // Assert the contents of the Raffle account
    const userInfoAccount = await program.account.userInfo.fetch(userInfo);
    assert.ok(userInfoAccount.owner.equals(kp.publicKey), "Owner pubkey should match");
    assert.equal(userInfoAccount.stakeAmount.toNumber(), stakeAmount.toNumber() * 2, `stakeAmount should match`);
    console.log("UserInfo account bump = ", userInfoAccount.bump);
    console.log("UserInfo account successfully created and verified");

    // check core asset count
    const assets = await fetchAssetsByOwner(umi, publicKey(kp.publicKey.toString()));
    assert.equal(assets.length, 1, "number of assets should match");

    // check core asset
    const assetAccount = await fetchAssetV1(umi, publicKey(asset.toString()));
    assert.equal(assetAccount.name, "Windfall PFP", "NFT name should match");
    assert.equal(assetAccount.uri, "https://api.softgate.co.jp/api/pfp/1", "NFT URI should match");
  });

  it("close_user_info", async () => {
    const closeTx = await program.methods.closeUserInfo(
    )
      .accounts({
        userInfo,
        // @ts-ignore
        owner: kp.publicKey,
        payer: kp.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        asset,
        coreProgram: MPL_CORE_PROGRAM_ID,
        authority,
      })
      .signers([kp])
      .rpc();
    console.log("Transaction signature: ", closeTx);

    // Attempt to fetch the closed userInfo account
    try {
      await program.account.userInfo.fetch(userInfo);
      assert.fail("UserInfo account should not exist after closing");
    } catch (error) {
      assert.equal(
        error.message,
        "Account does not exist or has no data " + userInfo.toBase58(),
        "Unexpected error message"
      );
    }

    // Wait for 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log("Waited for 3 seconds before checking asset count");

    // check core asset count
    const assets = await fetchAssetsByOwner(umi, publicKey(kp.publicKey.toString()));
    assert.equal(assets.length, 0, "number of assets should match");

  });
});
