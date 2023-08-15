import { resolve } from "path";
import { defineConfig, loadEnv } from "vite";
import qiankun from "vite-plugin-qiankun";
import vueJsx from "@vitejs/plugin-vue-jsx";
import vue from "@vitejs/plugin-vue";

export const pathResolve = (dir: string) => resolve(process.cwd(), ".", dir);

const additionalData = require("inl-ui/dist/theme").default;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    base: mode === "production" ? `/${env.VITE_APP_NAME}/` : "",
    server: {
      host: "0.0.0.0",
      port: 3000,
      headers: {
        // "Access-Control-Allow-Origin": "*",
      },
      // origin: "//localhost:5173",
      // cors: true,
      proxy: {
        "/micro-assets/": "http://192.168.5.200",
        // "/api/mtip/thing/v2/": {
        //   target: "http://192.168.9.144:8112/",
        // },
        "/api/": {
          target: "http://192.168.5.200",
        },
      },
    },
    optimizeDeps: {
      include: ["monaco-textmate", "monaco-editor-textmate"],
      exclude: [
        "inl-card-v2",
        "monaco-editor",
        "monaco-editor-core",
        "monaco-volar",
      ],
    },
    resolve: {
      alias: {
        "@": pathResolve("src"),
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData,
        },
      },
    },
    plugins: [
      vue(),
      vueJsx(),
      qiankun(env.VITE_APP_NAME, { useDevMode: true }),
    ],
  };
});
