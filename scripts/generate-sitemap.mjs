import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const siteUrl = 'https://stimsina.com';
const blogsDir = path.join(root, 'src', 'blogs');
const publicDir = path.join(root, 'public');
const sitemapPath = path.join(publicDir, 'sitemap.xml');

const blogFiles = fs.readdirSync(blogsDir).filter((file) => file.endsWith('.mdx'));
const blogEntries = blogFiles.map((file) => {
	const slug = file.replace(/\.mdx$/, '');
	const fullPath = path.join(blogsDir, file);
	const contents = fs.readFileSync(fullPath, 'utf8');
	const dateMatch = contents.match(/\bdate:\s*"([0-9-]+)"/);
	return {
		slug,
		lastmod: dateMatch ? dateMatch[1] : null
	};
});

const urls = [
	{ loc: '/', lastmod: null },
	{ loc: '/blog', lastmod: null },
	...blogEntries.map((entry) => ({
		loc: `/blog/${entry.slug}`,
		lastmod: entry.lastmod
	}))
];

const urlset = urls
	.map(({ loc, lastmod }) => {
		const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
		return `  <url>\n    <loc>${siteUrl}${loc}</loc>${lastmodTag}\n  </url>`;
	})
	.join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
	`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
	`${urlset}\n` +
	`</urlset>\n`;

fs.writeFileSync(sitemapPath, xml, 'utf8');
console.log(`sitemap written to ${sitemapPath}`);
