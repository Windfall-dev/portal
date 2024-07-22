import nextPwa from "next-pwa";

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
};

const withPWA = nextPwa({
  dest: "public",
});

export default withPWA(nextConfig);
