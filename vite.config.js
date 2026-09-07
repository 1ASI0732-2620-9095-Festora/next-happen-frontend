import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
    plugins: [
        vue({
            template: {
                compilerOptions: {
                    // 👇 Así Vue no trata a gmpx- como un componente
                    isCustomElement: (tag) => tag.startsWith("gmpx-"),
                },
            },
        }),
    ],

    base: "/",
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    },
    build: {
        outDir: "dist",
    },
});
