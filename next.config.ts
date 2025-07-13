import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { CSP_HEADER } from "./csp";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000",
          },
          {
            key: "Content-Security-Policy",
            value: CSP_HEADER.replace(/\n/g, ""),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
