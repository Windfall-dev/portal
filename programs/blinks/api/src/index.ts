import express, { Request, Response } from 'express';
import {
    ActionPostResponse,
    createPostResponse,
    ActionGetResponse,
    ActionPostRequest,
    createActionHeaders,
    ActionError,
} from "@solana/actions";
import {
    clusterApiUrl,
    Connection,
    PublicKey,
    Keypair,
    Transaction,
} from "@solana/web3.js";
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import * as anchor from '@coral-xyz/anchor';
// import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token';
import idl from '../../target/idl/prototype_raffle.json';

const app = express();
const port = 54321;

// TODO: Change this according to the current raffle account address
//EPPgdgMbmYbAh4r6dmjundu4ejKsP3bV6M6xNh3bLvoQ (devnet)
//EtvJhN91zTot7whwzWGTnF78XkF85QZYrGyKrjKkd1eY (mainnet for test)
//8LXAV2qN656fpQivtNZyp61JZWRMCDk8qmQB4MJ6i1ui (mainnet for demo)
const raffle = new PublicKey("8LXAV2qN656fpQivtNZyp61JZWRMCDk8qmQB4MJ6i1ui");
// devnet USDC mint (4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU)
// mainnet USDC mint (EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v)
// const tokenMint = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

// "mainnet-beta" or "devnet"
const defaultNetwork = "mainnet-beta";

const connection = new Connection(
    "https://mainnet.helius-rpc.com/?api-key=foobarbaz"
    // process.env.SOLANA_RPC! || clusterApiUrl(defaultNetwork),
);
const programPubkey = new PublicKey(idl.metadata.address);
const wallet = new anchor.Wallet(Keypair.generate());
const provider = new AnchorProvider(connection, wallet, {});
// @ts-ignore
const program = new Program(idl, programPubkey, provider);


app.use(express.json());

// create the standard headers for this route (including CORS)
// devnet:  EtWTRABZaYq6iMfeYKouRu166VU2xqa1
// mainnet: 5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp
const headers = createActionHeaders({ actionVersion: '2.1.3', chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp' });

// ルートエンドポイント(動作確認用)
app.get('/', (req: Request, res: Response) => {
    res.send('Hello, Express API!');
});

// 抽選 Action API エンドポイント
app.options('/draw', (_req: Request, res: Response) => {
    res.set(headers);
    res.sendStatus(204);
});

// Function to fetch and deserialize Raffle account data
async function fetchRaffleData(raffleAddress: PublicKey): Promise<[number, number, number, number]> {
    try {
        const raffleAccount = await program.account.raffle.fetch(raffleAddress);

        return [
            // @ts-ignore
            raffleAccount.ticketsRemaining[0].toNumber(), raffleAccount.ticketsRemaining[1].toNumber(), raffleAccount.ticketsRemaining[2].toNumber(), raffleAccount.ticketsRemaining[3].toNumber(),
        ];
    } catch (error) {
        console.error('Error fetching raffle data:', error);
        throw error;
    }
}

// Example usage:
// const connection = new Connection(clusterApiUrl('mainnet-beta'));
// const raffleAddress = new PublicKey('6tCjAFkvu2dS3wMXQ9tVXbSqThpL3w61VjRnjjBQAf8Z');
// const raffleData = await fetchRaffleData(connection, raffleAddress);
// console.log(raffleData);


app.get('/draw', async (_req: Request, res: Response) => {
    const tickets = await fetchRaffleData(raffle);

    const payload: ActionGetResponse = {
        type: "action",
        title: "Windfall Incentive Pull",
        icon: new URL("https://api.softgate.co.jp/images/dailyimg_01pullnow.png").toString(),
        // description: `On-chain Gacha Demo (Remaining: ${tickets[0]}/${tickets[1]}/${tickets[2]}/${tickets[3]})`,
        description: "",
        label: "Pull Now",
    };
    res.set(headers);
    res.json(payload);
});

app.post('/draw', async (req: Request, res: Response) => {
    try {
        const body: ActionPostRequest = req.body;

        // // Check if the user is eligible
        // const eligible = Math.random() < 0.1; // 10% chance of eligible
        // if (!eligible) {
        //     // If the user is not eligible, return an ActionError instead of ActionPostRequest.
        //     const errorPayload: ActionError = {
        //         message: "Sorry, you're not eligible. Please come back again next time!",
        //     };
        //     res.set(headers);
        //     res.status(400).json(errorPayload);
        //     return;
        // }

        let account: PublicKey;
        try {
            account = new PublicKey(body.account);
        } catch (err) {
            throw 'Invalid "account" provided';
        }

        const [drawRecordPDA, _drawRecordBump] = PublicKey.findProgramAddressSync(
            [
                anchor.utils.bytes.utf8.encode('raffle'),
                raffle.toBuffer(),
                account.toBuffer(),
            ],
            program.programId
        );

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
            await connection.getLatestBlockhash()
        ).blockhash;

        const tickets = await fetchRaffleData(raffle);

        const payload: ActionPostResponse = await createPostResponse({
            fields: {
                transaction,
                message: "Unveil Your Pull Result",
                // This will result in the next request coming as a POST.
                // However, if we don't return some kind of transaction, it will be treated as an error.
                //
                links: {
                    next: {
                        type: "inline",
                        action: {
                            type: "action",
                            title: "Windfall Incentive Pull",
                            icon: new URL("https://api.softgate.co.jp/images/dailyimg_02unveilnow.png").toString(),
                            // description: `On-chain Gacha Demo (Remaining: ${tickets[0]}/${tickets[1]}/${tickets[2]}/${tickets[3]})`,
                            description: "",
                            label: "Unveil Your Pull Result",
                            links: {
                                "actions": [
                                    {
                                        "label": "Unveil Now",
                                        // It seems the URL mapping is not working, so we need to include '/api' for it to be called
                                        "href": `/api/check`
                                    },
                                ]
                            }
                        }
                    }
                }
                // links: {
                //     next: {
                //         type: "inline",
                //         action: {
                //             type: "completed",
                //             title: "Windfall Demo - On-chain Raffle",
                //             icon: new URL("https://www.softgate.co.jp/api/solana_devs_done.png").toString(),
                //             description: "Windfall on-chain raffle drawn",
                //             label: "Thank you!",
                //         }
                //     }
                // }
            },
        });

        res.set(headers);
        res.json(payload);
    } catch (err) {
        console.log(err);
        let actionError: ActionError = { message: "An unknown error occurred" };
        if (typeof err == "string") actionError.message = err;
        res.set(headers);
        res.status(400);
        res.json({ message: actionError.message });
    }
});

// In action chaining, a POST request is received.
// The GET endpoint is not necessary for action chaining, so it's commented out.

// app.get('/check', (_req: Request, res: Response) => {
//     console.log("check GET");
//     const payload: ActionGetResponse = {
//         type: "action",
//         title: "Windfall Demo - On-chain Raffle",
//         icon: new URL("https://solana-actions.vercel.app/solana_devs.jpg").toString(),
//         description: "Check Windfall on-chain raffle",
//         label: "Check Now",
//     };
//     res.set(headers);
//     res.json(payload);
// });

// The POST endpoint below handles the action chaining request
app.post('/check', async (req: Request, res: Response) => {
    // console.log("check POST");

    const body: ActionPostRequest = req.body;
    // console.log("request:", req.body);

    let account: PublicKey;
    try {
        account = new PublicKey(body.account);
    } catch (err) {
        throw 'Invalid "account" provided';
    }

    const [drawRecordPDA, _drawRecordBump] = PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode('raffle'),
            raffle.toBuffer(),
            account.toBuffer(),
        ],
        program.programId
    );

    // Wait for 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Fetch the created Raffle account
    let drawRecordAccount;
    
    let attempts = 0;
    const maxAttempts = 5;
    while (attempts < maxAttempts) {
        try {
            drawRecordAccount = await program.account.drawRecord.fetch(drawRecordPDA, "confirmed");
            break;  // If successful, exit the loop
        } catch (error) {
            attempts++;
            if (attempts >= maxAttempts) {
                throw error;  // If all attempts failed, throw the last error
            }
            await new Promise(resolve => setTimeout(resolve, 3000));  // Wait for 3 seconds
        }
    }

    // // @ts-ignore
    // console.log(`draw_record: ${drawRecordPDA.toString()} [${drawRecordAccount.ticketsWon[0].toNumber()}/${drawRecordAccount.ticketsWon[1].toNumber()}/${drawRecordAccount.ticketsWon[2].toNumber()}/${drawRecordAccount.ticketsWon[3].toNumber()}]`);

    // @ts-ignore
    let epic = drawRecordAccount.ticketsWon[0].toNumber() > 0;
    // @ts-ignore
    let rare = drawRecordAccount.ticketsWon[1].toNumber() > 0;
    // @ts-ignore
    let uncommon = drawRecordAccount.ticketsWon[2].toNumber() > 0;

    // epic = false;
    // rare = false;
    // uncommon = false;

    let rank = "Common";
    let img = "03common";
    if (epic) {
        rank = "Epic";    
        img = "06epic";
    } else if  (rare) {
        rank = "Rare";
        img = "05rare";
    } else if  (uncommon) {
        rank = "Uncommon";
        img = "04uncommon";
    }
    
    const transaction = new Transaction();

    const nopIx = await program.methods.nop(
    )
        .accounts({
        })
        .instruction();

    transaction.add(nopIx);

    // set the end user as the fee payer
    transaction.feePayer = account;

    transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
    ).blockhash;


    // // Check if the user has won
    // const hasWon = Math.random() < 0.1; // 10% chance of winning

    // if (!hasWon) {
    //     // If the user hasn't won, return an ActionError
    //     const errorPayload: ActionError = {
    //         message: "Sorry, you didn't win this time. Better luck next draw!",
    //     };
    //     res.set(headers);
    //     res.status(400).json(errorPayload);
    //     return;
    // }

    // const won = Math.random() < 0.5;
    // const result = won ? "won" : "lost";

    // Create the payload for the response
    const payload: ActionPostResponse = await createPostResponse({
        fields: {
            transaction,
            message: `You have earned ${rank}!`,
            links: {
                next: {
                    type: "inline",
                    action: {
                        type: "completed",
                        title: "Windfall Incentive Pull",
                        icon: new URL(`https://api.softgate.co.jp/images/dailyimg_${img}.png`).toString(),
                        description: `You Pulled ${rank}`,
                        label: "Thank you!",
                    }
                }
            }
        },
    });

    res.set(headers);
    res.json(payload);
});

// PFP API endpoint
app.get('/pfp/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    const category = Number(id) % 5;
    let pfpData;

    switch (category) {
        case 0:
            pfpData = {
                name: "Windfall NFT #1",
                description: "Windfall PFP/Status/Badge",
                image: "https://api.softgate.co.jp/images/dailyimg_06epic.png",
                attributes: [
                    { trait_type: "Class", value: "Mage" },
                    { trait_type: "Level", value: 1 },
                    { trait_type: "Strength", value: 10 }
                ]
            };
            break;
        case 1:
            pfpData = {
                name: "Windfall NFT #2",
                image: "https://api.softgate.co.jp/images/dailyimg_05rare.png",
                attributes: [
                    { trait_type: "Class", value: "Skeleton" },
                    { trait_type: "Level", value: 2 },
                    { trait_type: "Time", value: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }) },
                    { trait_type: "Intelligence", value: 10 }
                ]
            };
            break;
        case 2:
            pfpData = {
                name: "Windfall NFT #3",
                image: "https://api.softgate.co.jp/images/dailyimg_04uncommon.png",
                attributes: [
                    { trait_type: "Class", value: "Rogue" },
                    { trait_type: "Level", value: 3 },
                    { trait_type: "Agility", value: 10 }
                ]
            };
            break;
        case 3:
            pfpData = {
                name: "Windfall NFT #4",
                image: "https://api.softgate.co.jp/images/dailyimg_03common.png",
                attributes: [
                    { trait_type: "Class", value: "Priest" },
                    { trait_type: "Level", value: 10 },
                    { trait_type: "Widsom", value: 10 }
                ]
            };
            break;
        default:
            pfpData = {
                name: "Windfall NFT #5",
                image: "https://api.softgate.co.jp/images/dailyimg_02unveilnow.png",
                attributes: [
                    { trait_type: "Class", value: "Samurai" },
                    { trait_type: "Level", value: 30 },
                    { trait_type: "Valor", value: 10 }
                ]
            };
    }

    res.set(headers);
    res.json(pfpData);
});


// 実験用ミント Action API エンドポイント
app.options('/mint', (_req: Request, res: Response) => {
    res.set(headers);
    res.sendStatus(204);
});

app.get('/mint', async (_req: Request, res: Response) => {
    const payload: ActionGetResponse = {
        type: "action",
        title: "Windfall Player PFP",
        icon: new URL("https://api.softgate.co.jp/images/dailyimg_01pullnow.png").toString(),
        description: `Mint Windfall NFT - Player PFP / Status / Badge`,
        label: "Mint Now",
    };
    res.set(headers);
    res.json(payload);
});

app.post('/mint', async (req: Request, res: Response) => {
    try {
        const body: ActionPostRequest = req.body;

        // // Check if the user is eligible
        // const eligible = Math.random() < 0.1; // 10% chance of eligible
        // if (!eligible) {
        //     // If the user is not eligible, return an ActionError instead of ActionPostRequest.
        //     const errorPayload: ActionError = {
        //         message: "Sorry, you're not eligible. Please come back again next time!",
        //     };
        //     res.set(headers);
        //     res.status(400).json(errorPayload);
        //     return;
        // }

        let account: PublicKey;
        try {
            account = new PublicKey(body.account);
        } catch (err) {
            throw 'Invalid "account" provided';
        }

        const [drawRecordPDA, _drawRecordBump] = PublicKey.findProgramAddressSync(
            [
                anchor.utils.bytes.utf8.encode('raffle'),
                raffle.toBuffer(),
                account.toBuffer(),
            ],
            program.programId
        );

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
            await connection.getLatestBlockhash()
        ).blockhash;

        const tickets = await fetchRaffleData(raffle);

        const payload: ActionPostResponse = await createPostResponse({
            fields: {
                transaction,
                message: "Unveil Your Pull Result",
                // This will result in the next request coming as a POST.
                // However, if we don't return some kind of transaction, it will be treated as an error.
                //
                links: {
                    next: {
                        type: "inline",
                        action: {
                            type: "action",
                            title: "Windfall Incentive Pull",
                            icon: new URL("https://api.softgate.co.jp/images/dailyimg_02unveilnow.png").toString(),
                            description: `On-chain Gacha Demo (Remaining: ${tickets[0]}/${tickets[1]}/${tickets[2]}/${tickets[3]})`,
                            label: "Unveil Your Pull Result",
                            links: {
                                "actions": [
                                    {
                                        "label": "Unveil Now",
                                        // It seems the URL mapping is not working, so we need to include '/api' for it to be called
                                        "href": `/api/check`
                                    },
                                ]
                            }
                        }
                    }
                }
                // links: {
                //     next: {
                //         type: "inline",
                //         action: {
                //             type: "completed",
                //             title: "Windfall Demo - On-chain Raffle",
                //             icon: new URL("https://www.softgate.co.jp/api/solana_devs_done.png").toString(),
                //             description: "Windfall on-chain raffle drawn",
                //             label: "Thank you!",
                //         }
                //     }
                // }
            },
        });

        res.set(headers);
        res.json(payload);
    } catch (err) {
        console.log(err);
        let actionError: ActionError = { message: "An unknown error occurred" };
        if (typeof err == "string") actionError.message = err;
        res.set(headers);
        res.status(400);
        res.json({ message: actionError.message });
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
