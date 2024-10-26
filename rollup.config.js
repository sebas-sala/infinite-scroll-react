import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
	input: "src/index.ts",
	output: [
		{
			file: "dist/index.js",
			format: "cjs",
			sourcemap: true,
		},
		{
			file: "dist/index.esm.js",
			format: "es",
			sourcemap: true,
		},
	],
	plugins: [typescript(), resolve(), commonjs()],
	external: ["react"],
};
