import { NextRequest, NextResponse } from "next/server";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  VersionedTransaction,
  Connection,
  TransactionInstruction,
  TransactionMessage,
} from "@solana/web3.js";

// Configure your Solana connection
const connection = new Connection(
  "https://api.mainnet-beta.solana.com",
  "confirmed"
);

const DONATION_DESTINATION_WALLET =
  "2PGWTL2ekudcrtaUvcNNN2ZLUyws9PeeURyYf8FsdYw3";
const DEFAULT_DONATION_AMOUNT_SOL = 1;

// CORS headers
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // Allow all origins
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

async function prepareTransaction(
  instructions: TransactionInstruction[],
  payer: PublicKey
) {
  const blockhash = await connection
    .getLatestBlockhash({ commitment: "confirmed" })
    .then((res) => res.blockhash);
  const messageV0 = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();
  return new VersionedTransaction(messageV0);
}

function getDonateInfo() {
  return {
    icon: "https://ucarecdn.com/7aa46c85-08a4-4bc7-9376-88ec48bb1f43/-/preview/880x864/-/quality/smart/-/format/auto/",
    title: "Donate to Alice",
    description:
      "Cybersecurity Enthusiast | Support my research with a donation.",
  };
}

async function prepareDonateTransaction(
  sender: PublicKey,
  recipient: PublicKey,
  lamports: number
): Promise<VersionedTransaction> {
  const payer = new PublicKey(sender);
  const instructions = [
    SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: new PublicKey(recipient),
      lamports: lamports,
    }),
  ];
  return prepareTransaction(instructions, payer);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { amount: string } }
) {
  const amount = params.amount;
  const { icon, title, description } = getDonateInfo();

  const response = {
    icon,
    label: `${amount} SOL`,
    title,
    description,
  };

  return new NextResponse(JSON.stringify(response), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { amount: string } }
) {
  const amount = params.amount ?? DEFAULT_DONATION_AMOUNT_SOL.toString();
  const body = await request.json();
  const { account } = body;

  const parsedAmount = parseFloat(amount);
  const transaction = await prepareDonateTransaction(
    new PublicKey(account),
    new PublicKey(DONATION_DESTINATION_WALLET),
    parsedAmount * LAMPORTS_PER_SOL
  );

  const response = {
    transaction: Buffer.from(transaction.serialize()).toString("base64"),
  };

  return new NextResponse(JSON.stringify(response), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
