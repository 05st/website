import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import mdx from '@mdx-js/rollup';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import rehypePrettyCode from 'rehype-pretty-code';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		preact(),
		mdx({
			remarkPlugins: [remarkMath, remarkGfm],
			rehypePlugins: [rehypeKatex, [rehypePrettyCode, { theme: "github-dark" }]]
		})
	],
});
