import { type NextRequest } from "next/server";
import { createSerwistRoute } from "@serwist/turbopack";
import { randomUUID } from "node:crypto";

function getRevision(): string {
  try {
    const { execSync } = require("child_process");
    const hash = execSync("git rev-parse HEAD", { encoding: "utf-8" }).trim();
    return hash;
  } catch {
    return randomUUID();
  }
}

const serwistRoute = createSerwistRoute({
  additionalPrecacheEntries: [{ url: "/~offline", revision: getRevision() }],
  swSrc: "src/app/sw.ts",
  useNativeEsbuild: true,
});

export const { GET } = serwistRoute;
