import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import mdx from '@mdx-js/rollup';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import rehypePrettyCode from 'rehype-pretty-code';
import { fileURLToPath } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		preact({
			prerender: {
				enabled: true,
				renderTarget: '#app',
				prerenderScript: fileURLToPath(new URL('./src/prerender.jsx', import.meta.url)),
				previewMiddlewareEnabled: true
			}
		}),
		mdx({
			remarkPlugins: [remarkMath, remarkGfm],
			rehypePlugins: [rehypeKatex, [rehypePrettyCode, { theme: "github-dark" }]]
		})
	],
});
