import nextPwa from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
};

const withPWA = nextPwa({ dest: "public" });
export default withPWA(nextConfig);
