/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    // Silence harmless `Critical dependency` warning from ox's intentional
    // `await import(id)` indirection (keeps `node:worker_threads` out of browser bundles).
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      { module: /ox\/_esm\/tempo\/internal\/virtualMasterPool\.js/ },
    ];
    return config;
  },
};

export default nextConfig;
