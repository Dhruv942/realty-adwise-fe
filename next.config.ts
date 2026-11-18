import type { NextConfig } from "next";

// The "server is waking up" hint only makes sense for a remote, cold-starting backend.
const apiHost = process.env.API_BASE_URL ? new URL(process.env.API_BASE_URL).hostname : "";
const isLocalApi = ["localhost", "127.0.0.1", "::1", "[::1]", "0.0.0.0"].includes(apiHost);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  env: { NEXT_PUBLIC_SHOW_WAKEUP_HINT: isLocalApi ? "" : "1" },
};

export default nextConfig;
