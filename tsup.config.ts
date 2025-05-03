import { defineConfig } from "tsup"

export default defineConfig({
    config: "./tsconfig.build.json",
    format: ["cjs"],
    entry: ["./src/index.ts"],
    dts: false,
    shims: true,
    skipNodeModulesBundle: false,
    clean: true,
    target: "node20",
    platform: "node",
    minify: false,
    bundle: true,
    // https://github.com/egoist/tsup/issues/619
    noExternal: [
        "steamworks.js",
        "adm-zip",
        "arktype",
        "chalk",
        "cmd-ts",
        "console-table-printer",
        "ohm-js",
        "xstate",
        "word-wrap",
        "node-fetch"
    ],
    external: [
        "electron",
        "./dist/win64/steamworksjs.win32-x64-msvc.node",
        "./dist/linux64/steamworksjs.linux-x64-gnu.node",
        "./dist/osx/steamworksjs.darwin-x64.node",
        "./dist/osx/steamworksjs.darwin-arm64.node"
    ],
    splitting: false
})
