import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // There's a stray (empty) package-lock.json one directory up, so Turbopack
  // guesses the repo root wrongly. Pin it to this app.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
