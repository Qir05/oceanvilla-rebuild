import type { NextConfig } from "next";

const bookingBase =
  process.env.HOSTAWAY_BOOKING_ENGINE_BASE_URL ||
  process.env.NEXT_PUBLIC_BOOKING_URL ||
  "https://182003_1.holidayfuture.com";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/book",
        destination: bookingBase,
        permanent: false,
      },
      {
        source: "/booking",
        destination: bookingBase,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
