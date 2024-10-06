import { program, defaultConnection, defaultKeypairPath } from "./index";
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import * as anchor from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { getNow, loadKeypair, toUTCDayjs, truncateToHour } from "./utils";
import idl from '../../target/idl/prototype_raffle.json';

export function defineCommands() {
    program
        .command('list-raffles')
        .description('List all raffles')
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
        .action(listRaffles);

    program
        .command('new-raffle')
        .description('Create a new raffle')
        .option(
            '-a, --authority <keypair-path>',
            'The keypair path of the authority (default: payer keypair path)'
        )
        .requiredOption(
            '-0, --r0 <num-tickets>',
            'The number of rank 0 tickets'
        )
        .requiredOption(
            '-1, --r1 <num-tickets>',
            'The number of rank 0 tickets'
        )
        .requiredOption(
            '-2, --r2 <num-tickets>',
            'The number of rank 0 tickets'
        )
        .requiredOption(
            '-3, --r3 <num-tickets>',
            'The number of rank 0 tickets'
        )
        .requiredOption(
            '-t, --tickets <num-tickets>',
            'The maximum number of tickets per user'
        )
        // .requiredOption(
        //     '-m, --mint <pubkey>',
        //     'The public key of the reward token mint'
        // )
        // .requiredOption(
        //     '-w, --winning <num-tickets>',
        //     'The number of winning tickets'
        // )
        // .requiredOption(
        //     '-l, --losing <num-tickets>',
        //     'The number of losing tickets'
        // )
        // .requiredOption(
        //     '-p, --payout <token-amount>',
        //     'The payout amount of the reward token per win'
        // )
        .option(
            '-s, --start <date-time>',
            'The start date and time of the raffle (default: now)'
        )
        .option(
            '-e, --end <date-time>',
            'The end date and time of the raffle (default: 1 day after start)'
        )
        .option(
            '-f, --identifier <pubkey>',
            'The identifier public key (default: <generated at random>)'
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
        // .option(
        //     '-t, --create-token-account',
        //     'Create associated token account for raffle'
        // )
        .action(newRaffle);

        program
        .command('close-raffle')
        .description('Close a raffle')
        .requiredOption(
            '-r, --raffle <pubkey>',
            'The public key of the raffle account to close'
        )
        .option(
            '-a, --authority <keypair-path>',
            'The keypair path of the authority (default: payer keypair path)'
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
        .action(closeRaffle);
}

async function listRaffles({ connection, keypairPath, programId }: {
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

    const raffles = await program.account.raffle.all();
    raffles.forEach((r, index) => {
        const raffle = r.account;
        console.log(`Raffle [${index + 1}/${raffles.length}]: Pubkey ${r.publicKey}`);
        console.log(`  Identifier: ${raffle.identifier.toString()}`);
        console.log(`  Authority: ${raffle.authority.toString()}`);
        // @ts-ignore
        console.log(`  Start Timestamp: ${new Date(raffle.startTs.toNumber() * 1000).toUTCString()}`);
        // @ts-ignore
        console.log(`  End Timestamp: ${new Date(raffle.endTs.toNumber() * 1000).toUTCString()}`);
        // @ts-ignore
        console.log(`  Tickets Remaining: ${raffle.ticketsRemaining.map(t => t.toString()).join(', ')}`);
        console.log(`  Max Tickets Per User: ${raffle.ticketsMaxPerUser.toString()}`);
        console.log(`  Bump: ${raffle.bump}`);
        console.log(`  Is Active: ${raffle.isActive}`);
        console.log(`  Is Public: ${raffle.isPublic}`);
        console.log('');
    });
}

async function newRaffle({ authority, r0, r1, r2, r3, tickets, start, end, identifier, connection, keypairPath, programId }: {
    authority: string
    r0: string
    r1: string
    r2: string
    r3: string
    tickets: string
    start: string
    end: string
    identifier: string
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

    const authorityKp = loadKeypair(authority ?? payer);
    const idenfitierPubkey = new PublicKey(identifier ?? anchor.web3.Keypair.generate().publicKey);
    const ticketsTotal = [
        new anchor.BN(r0),
        new anchor.BN(r1),
        new anchor.BN(r2),
        new anchor.BN(r3)
      ];
    const startDayjs = start ? truncateToHour(toUTCDayjs(start)) : getNow();
    const startTime = new anchor.BN(startDayjs.valueOf() / 1000);
    const endTime = new anchor.BN(truncateToHour(end ? toUTCDayjs(end) : startDayjs.add(1, 'day')).valueOf() / 1000);

    const [rafflePDA, _] = PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode('raffle'),
            idenfitierPubkey.toBuffer(),
            authorityKp.publicKey.toBuffer(),
        ],
        program.programId
    );

    // Create a new raffle
    try {
        const newRaffleTx = await program.methods.newRaffle(
            startTime,
            endTime,
            ticketsTotal,
            new anchor.BN(tickets),
            true,
        )
            .accounts({
                identifier: idenfitierPubkey,
                authority: authorityKp.publicKey,
                raffle: rafflePDA,
                payer: wallet.payer.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([wallet.payer, authorityKp])
            .rpc();
        console.log("Transaction signature:", newRaffleTx);

        // if (createTokenAccount) {
        //     const raffleTokenAccount = await getOrCreateAssociatedTokenAccount(program.provider.connection, wallet.payer, mintPubkey, rafflePDA, true);
        //     console.log("Created ATA token account:", raffleTokenAccount.address.toString());
        // }
        console.log("Created raffle:", rafflePDA.toString());
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

// async function newRaffle({ authority, mint, winning, losing, payout, start, end, identifier, connection, keypairPath, programId, createTokenAccount }: {
//     authority: string
//     mint: string
//     winning: string
//     losing: string
//     payout: string
//     start: string
//     end: string
//     identifier: string
//     connection: string
//     keypairPath: string
//     programId: string
//     createTokenAccount: boolean
// }) {
//     const conn = new Connection(connection ? connection : defaultConnection);
//     const programPubkey = new PublicKey(programId ? programId : idl.metadata.address);
//     const payer = keypairPath ?? defaultKeypairPath;
//     const wallet = new Wallet(loadKeypair(payer));
//     const provider = new AnchorProvider(conn, wallet, {});
//     // @ts-ignore
//     const program = new Program(idl, programPubkey, provider);

//     const authorityKp = loadKeypair(authority ?? payer);
//     const idenfitierPubkey = new PublicKey(identifier ?? anchor.web3.Keypair.generate().publicKey);
//     const mintPubkey = new PublicKey(mint);
//     const numWin = new anchor.BN(winning);
//     const numLose = new anchor.BN(losing);
//     const payoutAmount = new anchor.BN(payout);
//     const startDayjs = start ? truncateToHour(toUTCDayjs(start)) : getNow();
//     const startTime = new anchor.BN(startDayjs.valueOf() / 1000);
//     const endTime = new anchor.BN(truncateToHour(end ? toUTCDayjs(end) : startDayjs.add(1, 'day')).valueOf() / 1000);

//     const [rafflePDA, _] = PublicKey.findProgramAddressSync(
//         [
//             anchor.utils.bytes.utf8.encode('raffle'),
//             idenfitierPubkey.toBuffer(),
//             authorityKp.publicKey.toBuffer(),
//         ],
//         program.programId
//     );

//     // Create a new raffle
//     try {
//         const newRaffleTx = await program.methods.newRaffle(
//             startTime,
//             endTime,
//             numWin,
//             numLose,
//             payoutAmount,
//             true,
//         )
//             .accounts({
//                 identifier: idenfitierPubkey,
//                 authority: authorityKp.publicKey,
//                 raffle: rafflePDA,
//                 mint: mintPubkey,
//                 payer: wallet.payer.publicKey,
//                 systemProgram: anchor.web3.SystemProgram.programId,
//             })
//             .signers([wallet.payer, authorityKp])
//             .rpc();
//         console.log("Transaction signature:", newRaffleTx);

//         if (createTokenAccount) {
//             const raffleTokenAccount = await getOrCreateAssociatedTokenAccount(program.provider.connection, wallet.payer, mintPubkey, rafflePDA, true);
//             console.log("Created ATA token account:", raffleTokenAccount.address.toString());
//         }
//         console.log("Created raffle:", rafflePDA.toString());
//     } catch (error) {
//         if (error instanceof anchor.web3.SendTransactionError) {
//             console.error("SendTransactionError occurred:");
//             console.error("Error message:", error.message);
//             console.error("Error logs:", error.logs);
//         } else {
//             console.error("An unexpected error occurred:", error);
//         }
//     }
// }

async function closeRaffle({ raffle, authority, connection, keypairPath, programId }: {
    raffle: string
    authority: string
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
    const authorityKp = loadKeypair(authority ?? payer);

    // Close a raffle
    try {
        const closeRaffleTx = await program.methods.closeRaffle(
        )
            .accounts({
                raffle: rafflePubkey,
                authority: authorityKp.publicKey,
                payer: wallet.payer.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([wallet.payer, authorityKp])
            .rpc();
        console.log("Transaction signature:", closeRaffleTx);
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
