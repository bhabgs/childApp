import { resolve } from "path";
import { defineConfig, loadEnv } from "vite";
import vueJsx from "@vitejs/plugin-vue-jsx";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";

export const pathResolve = (dir: string) => resolve(process.cwd(), ".", dir);

const additionalData = require("inl-ui/dist/theme").default;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    build: {
      target: "modules",
      minify: false,
      emptyOutDir: true,
      lib: {
        entry: resolve(__dirname, "packages/flowChart.ts"),
        formats: ["es", "cjs"],
        name: "flowChart",
        fileName: "flowChart",
      },
      //打包文件目录
      outDir: "lib",

      rollupOptions: {
        external: ["vue"],
        input: ["packages/flowChart.ts"],
        output: {
          format: "es",
          globals: {
            vue: "Vue",
          },
        },
      },
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
      dts({
        include: "packages/flowChart.ts",
        entryRoot: "packages",
        outputDir: "lib",
        tsConfigFilePath: "./tsconfig.json",
      }),
    ],
  };
});
