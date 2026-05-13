/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@sportlink/types"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Google avatars
    ],
  },
};

export default nextConfig;
