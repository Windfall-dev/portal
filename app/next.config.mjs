import nextPwa from "next-pwa";

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
};

const withPWA = nextPwa();

export default withPWA(nextConfig);
