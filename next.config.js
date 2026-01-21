/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    eslint: {
        ignoreDuringBuilds: false,
    },
    images: {
        // Legacy domains support (for backward compatibility)
        domains: [
            "res.cloudinary.com",
            "i.dummyjson.com",
            "www.superkicks.in",
            "www.bata.com",
            "static.nike.com",
            "nike.com"
        ],
        // Modern remotePatterns (recommended for Next.js 13+)
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: 'i.dummyjson.com',
            },
            {
                protocol: 'https',
                hostname: 'www.superkicks.in',
            },
            {
                protocol: 'https',
                hostname: 'www.bata.com',
            },
            {
                protocol: 'https',
                hostname: 'static.nike.com',
            },
            {
                protocol: 'https',
                hostname: '**.nike.com', // Wildcard for all Nike subdomains
            },
            {
                protocol: 'https',
                hostname: 'nike.com',
            },
        ],
    },
    webpack: (config) => {
        // this will override the experiments
        config.experiments = { ...config.experiments, topLevelAwait: true };
        // this will just update topLevelAwait property of config.experiments
        // config.experiments.topLevelAwait = true
        return config;
      },

};

module.exports = nextConfig;
