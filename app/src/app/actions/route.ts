import { NextRequest, NextResponse } from "next/server";

const DONATION_AMOUNT_SOL_OPTIONS = [1, 5, 10];
const DEFAULT_DONATION_AMOUNT_SOL = 1;

// CORS headers
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // Allow all origins
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function getDonateInfo() {
  return {
    icon: "https://ucarecdn.com/7aa46c85-08a4-4bc7-9376-88ec48bb1f43/-/preview/880x864/-/quality/smart/-/format/auto/",
    title: "Donate to Windfall",
    description:
      "Cybersecurity Enthusiast | Support my research with a donation.",
  };
}

export async function GET(request: NextRequest) {
  const { icon, title, description } = getDonateInfo();

  const amountParameterName = "amount";
  const response = {
    icon,
    label: `${DEFAULT_DONATION_AMOUNT_SOL} SOL`,
    title,
    description,
    links: {
      actions: [
        ...DONATION_AMOUNT_SOL_OPTIONS.map((amount) => ({
          label: `${amount} SOL`,
          href: `/actions/${amount}`,
        })),
        {
          href: `/actions/{amount}`,
          label: "Donate",
          parameters: [
            {
              name: amountParameterName,
              label: "Enter a custom SOL amount",
            },
          ],
        },
      ],
    },
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
