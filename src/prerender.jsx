import { prerender as ssr } from 'preact-iso';
import { App } from './app.jsx';

const files = import.meta.glob('./blogs/*.mdx', { eager: true });
const blogs = Object.entries(files)
	.map(([path, mod]) => ({
		slug: path.replace('./blogs/', '').replace('.mdx', ''),
		// @ts-ignore
		metadata: mod.metadata
	}))
	.sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());

const siteTitle = 'Sami Timsina';

function buildHead(url) {
	const siteUrl = import.meta.env.VITE_SITE_URL || '';
	const normalizedUrl = url || '/';
	const isBlogPost = normalizedUrl.startsWith('/blog/') && normalizedUrl !== '/blog/';
	const slug = normalizedUrl.replace('/blog/', '').replace(/\/$/, '');
	const blog = isBlogPost ? blogs.find((item) => item.slug === slug) : null;
	const title = blog?.metadata?.title
		? `${blog.metadata.title} — ${siteTitle}`
		: normalizedUrl === '/blog'
			? `blog — ${siteTitle}`
			: siteTitle;
	const description = blog?.metadata?.description || 'writing and notes.';
	const canonical = siteUrl ? `${siteUrl}${normalizedUrl}` : '';
	const elements = new Set();

	elements.add({ type: 'meta', props: { name: 'description', content: description } });
	if (canonical) {
		elements.add({ type: 'link', props: { rel: 'canonical', href: canonical } });
		elements.add({ type: 'meta', props: { property: 'og:url', content: canonical } });
		elements.add({ type: 'meta', props: { name: 'twitter:url', content: canonical } });
	}
	if (blog?.metadata?.date) {
		elements.add({ type: 'meta', props: { property: 'article:published_time', content: blog.metadata.date } });
	}
	(blog?.metadata?.tags || []).forEach((tag) => {
		elements.add({ type: 'meta', props: { property: 'article:tag', content: tag } });
	});

	elements.add({ type: 'meta', props: { property: 'og:title', content: title } });
	elements.add({ type: 'meta', props: { property: 'og:description', content: description } });
	elements.add({ type: 'meta', props: { property: 'og:type', content: blog ? 'article' : 'website' } });
	elements.add({ type: 'meta', props: { name: 'twitter:card', content: 'summary' } });
	elements.add({ type: 'meta', props: { name: 'twitter:title', content: title } });
	elements.add({ type: 'meta', props: { name: 'twitter:description', content: description } });

	return {
		title,
		elements
	};
}

export async function prerender(data) {
	const { html, links } = await ssr(<App />);
	return {
		html,
		links,
		head: buildHead(data?.url)
	};
}
