import { defineConfig, loadEnv } from "vite";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    return {
        define: {
            "import.meta.env.VITE_GEMMA_API_KEY": JSON.stringify(env.VITE_GEMMA_API_KEY),
        },
        build: {
            outDir: "dist",
            rollupOptions: {
                input: {
                    content: resolve(__dirname, "src/content.ts"),
                    background: resolve(__dirname, "src/background.ts"),
                },
                output: {
                    entryFileNames: "[name].js",
                    format: "esm",
                },
            },
        },
    };
});