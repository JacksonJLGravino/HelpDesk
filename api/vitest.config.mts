import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  Object.assign(process.env, env);
  process.env.NODE_ENV = "test";

  return {
    test: {
      environment: "node",
      fileParallelism: false,
      setupFiles: ["./src/test/setup.ts"],
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
