import { program, defaultConnection, defaultKeypairPath } from "./index";
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import * as anchor from '@coral-xyz/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { getNow, loadKeypair, toUTCDayjs, truncateToHour } from "./utils";
import idl from '../../target/idl/prototype_raffle.json';

export function defineCommands() {
    program
        .command('draw')
        .description('Draw a raffle')
        .requiredOption(
            '-r, --raffle <pubkey>',
            'The public key of the raffle to draw'
        )
        // .requiredOption(
        //     '-m, --mint <pubkey>',
        //     'The public key of the reward token mint'
        // )
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
        // .option(
        //     '-t, --create-token-account',
        //     'Create associated token account'
        // )
        .action(draw);

    program
        .command('list-draw-records')
        .description('List draw records')
        .requiredOption(
            '-r, --raffle <pubkey>',
            'The public key of the raffle to draw'
        )
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
        .action(listDrawRecords);

    program
        .command('export-draw-records')
        .description('Export draw records')
        .requiredOption(
            '-r, --raffle <pubkey>',
            'The public key of the raffle to draw'
        )
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
        .action(exportDrawRecords);
}

async function draw({ raffle, connection, keypairPath, programId }: {
    raffle: string
    connection: string
    keypairPath: string
    programId: string
}) {
    const conn = new Connection(connection ? connection : defaultConnection);
    const programPubkey = new PublicKey(programId ? programId : idl.metadata.address);
    const payer = keypairPath ?? defaultKeypairPath;
    const wallet = new Wallet(loadKeypair(payer));
    const provider = new AnchorProvider(conn, wallet, {});
    // @ts-ignore
    const program = new Program(idl, programPubkey, provider);

    const rafflePubkey = new PublicKey(raffle);

    const account = wallet.publicKey;

    const [drawRecordPDA, _drawRecordBump] = PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode('raffle'),
            rafflePubkey.toBuffer(),
            account.toBuffer(),
        ],
        program.programId
    );

    console.log(`Drawing (dr: ${drawRecordPDA.toString()})`);

    const transaction = new Transaction();

    const ticketsToDraw = new anchor.BN(1);
    const drawIx = await program.methods.draw(
        ticketsToDraw
    )
        .accounts({
            raffle,
            drawRecord: drawRecordPDA,
            userAuthority: account,
            payer: account,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();

    transaction.add(drawIx);

    // set the end user as the fee payer
    transaction.feePayer = account;
    transaction.recentBlockhash = (
        await conn.getLatestBlockhash()
    ).blockhash;

    // Draw a raffle
    try {
        // Sign the transaction
        const signedTransaction = await wallet.signTransaction(transaction);

        // Send and confirm the transaction
        const signature = await conn.sendRawTransaction(signedTransaction.serialize());
        console.log("Transaction sent. Signature:", signature);

        // Wait for transaction confirmation
        const confirmation = await conn.confirmTransaction(signature, 'confirmed');
        
        if (confirmation.value.err) {
            throw new Error(`Transaction failed: ${confirmation.value.err}`);
        }

        console.log("Transaction confirmed successfully!");

        const drawRecordAccount = await program.account.drawRecord.fetch(drawRecordPDA);    
        console.log(`draw record: ${drawRecordAccount.ticketsWon[0].toNumber()}, ${drawRecordAccount.ticketsWon[1].toNumber()}, ${drawRecordAccount.ticketsWon[2].toNumber()}, ${drawRecordAccount.ticketsWon[3].toNumber()}`)
    
        // // Fetch the updated DrawRecord account
        // const updatedDrawRecord = await program.account.drawRecord.fetch(drawRecordPDA);
        // console.log("Updated DrawRecord:", updatedDrawRecord);

        // // Fetch the user's token balance
        // const userTokenBalance = await conn.getTokenAccountBalance(userTokenAccount);
        // console.log("User's token balance:", userTokenBalance.value.uiAmount);

    } catch (error) {
        if (error instanceof anchor.web3.SendTransactionError) {
            console.error("SendTransactionError occurred:");
            console.error("Error message:", error.message);
            console.error("Error logs:", error.logs);
        } else {
            console.error("An unexpected error occurred:", error);
        }
    }
}

async function listDrawRecords({ raffle, connection, keypairPath, programId }: {
    raffle: string
    connection: string
    keypairPath: string
    programId: string
}) {
    const conn = new Connection(connection ? connection : defaultConnection);
    const programPubkey = new PublicKey(programId ? programId : idl.metadata.address);
    const wallet = new Wallet(loadKeypair(keypairPath ? keypairPath : defaultKeypairPath));
    const provider = new AnchorProvider(conn, wallet, {});
    // @ts-ignore
    const program = new Program(idl, programPubkey, provider);

    const rafflePubkey = new PublicKey(raffle);

    const drawRecords = await program.account.drawRecord.all([
        {
            memcmp: {
                offset: 40, // Assuming 'raffle' is the first field after the account discriminator
                bytes: rafflePubkey.toBase58()
            }
        }
    ]);

    // const raffles = await program.account.raffle.all();
    drawRecords.forEach((d, index) => {
        const dr = d.account;
        console.log(`Draw Record [${index + 1}/${drawRecords.length}]: Pubkey ${d.publicKey}`);
        console.log(`  User Authority: ${dr.userAuthority.toString()}`);
        console.log(`  Raffle: ${dr.raffle.toString()}`);
        console.log(`  Tickets Allocated: ${dr.ticketsAllocated.toString()}`);
        // @ts-ignore
        console.log(`  Tickets Won: ${dr.ticketsWon.map(t => t.toString()).join(', ')}`);
        console.log('');
    });
}

async function exportDrawRecords({ raffle, connection, keypairPath, programId }: {
    raffle: string
    connection: string
    keypairPath: string
    programId: string
}) {
    const conn = new Connection(connection ? connection : defaultConnection);
    const programPubkey = new PublicKey(programId ? programId : idl.metadata.address);
    const wallet = new Wallet(loadKeypair(keypairPath ? keypairPath : defaultKeypairPath));
    const provider = new AnchorProvider(conn, wallet, {});
    // @ts-ignore
    const program = new Program(idl, programPubkey, provider);

    const rafflePubkey = new PublicKey(raffle);

    const drawRecords = await program.account.drawRecord.all([
        {
            memcmp: {
                offset: 40, // Assuming 'raffle' is the first field after the account discriminator
                bytes: rafflePubkey.toBase58()
            }
        }
    ]);

    // const raffles = await program.account.raffle.all();
    drawRecords.forEach((d, index) => {
        const dr = d.account;
        // @ts-ignore
        console.log(`${dr.userAuthority.toString()},${d.publicKey},${dr.ticketsWon.map(t => t.toString()).join(',')}`);
    });
}