import { program, defaultConnection, defaultKeypairPath } from "./index";
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import * as anchor from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { fetchAssetsByOwner, fetchAssetV1, MPL_CORE_PROGRAM_ID } from "@metaplex-foundation/mpl-core";
import { loadKeypair } from "./utils";
import idl from '../../target/idl/staking.json';
//import { Staking } from "../../target/types/staking";

export function defineCommands() {
    program
        .command('list-user-info')
        .description('List user info')
        .option(
            '-c, --connection <connection>',
            'The connection URL of Solana RPC'
        )
        .option(
            '-k, --keypair-path <keypair-path>',
            'Path of the payer keypair to use (default: ~/.config/solana/id.json)'
        )
        .option(
            '-i, --program-id <program-id>',
            'The program ID'
        )
        .action(listUserInfo);

    program
        .command('new-user-info')
        .description('Create a new user info')
        .option(
            '-c, --connection <connection>',
            'The connection URL of Solana RPC'
        )
        .option(
            '-k, --keypair-path <keypair-path>',
            'Path of the payer keypair to use (default: ~/.config/solana/id.json)'
        )
        .option(
            '-i, --program-id <program-id>',
            'The program ID'
        )
        .action(newUserInfo);

    program
        .command('stake')
        .description('Stake some token')
        .requiredOption(
            '-u, --user-info <pubkey>',
            'The public key of the user info account to close'
        )
        .requiredOption(
            '-s, --asset <pubkey>',
            'The keypair path of the asset'
        )
        .option(
            '-c, --connection <connection>',
            'Connection URL of Solana RPC'
        )
        .option(
            '-k, --keypair-path <keypair-path>',
            'Path of the keypair to use (default: ~/.config/solana/id.json)'
        )
        .option(
            '-i, --program-id <program-id>',
            'The program ID'
        )
        .action(stake);

    program
        .command('close-user-info')
        .description('Close a user info')
        .requiredOption(
            '-u, --user-info <pubkey>',
            'The public key of the user info account to close'
        )
        .requiredOption(
            '-s, --asset <pubkey>',
            'The keypair path of the asset'
        )
        .option(
            '-c, --connection <connection>',
            'Connection URL of Solana RPC'
        )
        .option(
            '-k, --keypair-path <keypair-path>',
            'Path of the keypair to use (default: ~/.config/solana/id.json)'
        )
        .option(
            '-i, --program-id <program-id>',
            'The program ID'
        )
        .action(closeUserInfo);
}

async function listUserInfo({ connection, keypairPath, programId }: {
    connection: string
    keypairPath: string
    programId: string
}) {
    const conn = new Connection(connection ? connection : defaultConnection);
    const payer = keypairPath ?? defaultKeypairPath;
    const wallet = new Wallet(loadKeypair(payer));
    const provider = new anchor.AnchorProvider(conn, wallet, anchor.AnchorProvider.defaultOptions());
    anchor.setProvider(provider);

    // @ts-ignore
    const program = new Program(idl, provider);  
    // @ts-ignore
    const accounts = await program.account.userInfo.all();
    accounts.forEach((r, index) => {
        const ui = r.account;
        console.log(`UserInfo [${index + 1}/${accounts.length}]: Pubkey ${r.publicKey}`);
        console.log(`  stakeAmount: ${ui.stakeAmount.toNumber()}`);
        console.log(`  owner: ${ui.owner.toString()}`);
        console.log(`  vault: ${ui.vault.toString()}`);
        console.log(`  bump: ${ui.bump.toString()}`);
        console.log('');
    });}

async function newUserInfo({ connection, keypairPath, programId }: {
    connection: string
    keypairPath: string
    programId: string
}) {
    const conn = new Connection(connection ? connection : defaultConnection);
    const payer = keypairPath ?? defaultKeypairPath;
    const wallet = new Wallet(loadKeypair(payer));
    const provider = new anchor.AnchorProvider(conn, wallet, anchor.AnchorProvider.defaultOptions());
    anchor.setProvider(provider);

    // @ts-ignore
    const program = new Program(idl, provider);

    const vault = wallet.publicKey;

    console.log(`programId: ${program.programId.toString()}`);

    const [userInfo, _userInfoBump] = PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode('staking'),
            vault.toBuffer(),
            wallet.publicKey.toBuffer(),
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

    console.log(`userInfo address: ${userInfo.toString()}`);
    console.log(`asset address: ${asset.toString()}`);
    console.log(`vault address: ${vault.toString()}`);

    const tx = await program.methods.newUserInfo(
        stakeAmount,
    ).accounts({
        userInfo,
        asset,
        coreProgram: MPL_CORE_PROGRAM_ID,
        // coreProgram: new PublicKey("3tJu7QJGpUxRzjSNkns8HVuqZmcaQMtd7zMpzFmsAAix"),
        owner: wallet.publicKey,
        vault,
        authority,
        payer: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
    })
        .signers([wallet.payer, assetKp])
        .rpc();
    console.log("Your transaction signature", tx);

    // // Wait for 7 seconds (not always enough)
    // await new Promise(resolve => setTimeout(resolve, 7_000));

    // // @ts-ignore
    // const userInfoAccount = await program.account.userInfo.fetch(userInfo);
    // console.log("UserInfo stake amount = ", userInfoAccount.stakeAmount.toNumber());

    console.log(`next option: -u ${userInfo.toString()} -s ${asset.toString()}`);
}

async function stake({ userInfo, asset, connection, keypairPath, programId }: {
    userInfo: string
    asset: string
    connection: string
    keypairPath: string
    programId: string
}) {
    const conn = new Connection(connection ? connection : defaultConnection);
    const payer = keypairPath ?? defaultKeypairPath;
    const wallet = new Wallet(loadKeypair(payer));
    const provider = new anchor.AnchorProvider(conn, wallet, anchor.AnchorProvider.defaultOptions());
    anchor.setProvider(provider);

    // @ts-ignore
    const program = new Program(idl, provider);

    const [authority, _authorityBump] = PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode('authority'),
        ],
        program.programId
    );

    const userInfoPubkey = new PublicKey(userInfo);
    const assetPubkey = new PublicKey(asset);
    const stakeAmount = new anchor.BN(1_000_000);

    const stakeTx = await program.methods.stake(
        stakeAmount
    )
      .accounts({
        userInfo: userInfoPubkey,
        owner: wallet.publicKey,
        payer: wallet.publicKey,
        vault: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        asset: assetPubkey,
        coreProgram: MPL_CORE_PROGRAM_ID,
        authority,
      })
      .signers([wallet.payer])
      .rpc();
    console.log("Transaction signature: ", stakeTx);

    // // Wait for 3 seconds
    // await new Promise(resolve => setTimeout(resolve, 7_000));

    // // @ts-ignore
    // const userInfoAccount = await program.account.userInfo.fetch(userInfo);
    // console.log("UserInfo stake amount = ", userInfoAccount.stakeAmount.toNumber());
}

async function closeUserInfo({ userInfo, asset, connection, keypairPath, programId }: {
    userInfo: string
    asset: string
    connection: string
    keypairPath: string
    programId: string
}) {
    const conn = new Connection(connection ? connection : defaultConnection);
    const payer = keypairPath ?? defaultKeypairPath;
    const wallet = new Wallet(loadKeypair(payer));
    const provider = new anchor.AnchorProvider(conn, wallet, anchor.AnchorProvider.defaultOptions());
    anchor.setProvider(provider);

    // @ts-ignore
    const program = new Program(idl, provider);

    const [authority, _authorityBump] = PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode('authority'),
        ],
        program.programId
    );

    const userInfoPubkey = new PublicKey(userInfo);
    const assetPubkey = new PublicKey(asset);

    const closeTx = await program.methods.closeUserInfo(
    )
      .accounts({
        userInfo: userInfoPubkey,
        // @ts-ignore
        owner: wallet.publicKey,
        payer: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        asset: assetPubkey,
        coreProgram: MPL_CORE_PROGRAM_ID,
        authority,
      })
      .signers([wallet.payer])
      .rpc();
    console.log("Transaction signature: ", closeTx);
}
