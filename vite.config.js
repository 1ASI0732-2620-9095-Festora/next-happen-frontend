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
    server: {
        port: 5173,
        proxy: {
            "/api": {
                target: "https://next-happen-backend-hbts.onrender.com",
                changeOrigin: true,
                secure: false,
            },
            "/proxy": {
                target: "https://next-happen-backend-hbts.onrender.com",
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/proxy/, ""),
            },
        },
    },
});
