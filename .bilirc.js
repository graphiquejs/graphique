const path = require("path")
// const peerDepsExternal = require('rollup-plugin-peer-deps-external')

module.exports = {
  input: "./src/index.ts",
  output: {
    moduleName: "@graphique/graphique",
    minify: true,
    format: ["umd", "esm", "cjs"],
    dir: "./lib"
  },
  plugins: {
    typescript2: {
      cacheRoot: path.join(__dirname, ".rpt2_cache"),
      useTsconfigDeclarationDir: true
    },
    "peer-deps-external": true
  }
};
