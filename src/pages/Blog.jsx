import { MDXProvider } from '@mdx-js/preact';
import { useLocation } from 'preact-iso';
import { NotFound } from './_404';

const files = import.meta.glob("../blogs/*.mdx", { eager: true });
const blogs = Object.entries(files).map(([path, mod]) => ({
    slug: path.replace("../blogs/", "").replace(".mdx", ""),
    // @ts-ignore
    metadata: mod.metadata,
    // @ts-ignore
    component: mod.default
})).sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());

const components= {
    em(properties) {
        return <i {...properties} />;
    }
}

export function BlogPost() {
    const { path } = useLocation();
    const slug = path.replace("/blog/", "");
    const blog = blogs.find((b) => b.slug == slug);

    if (!blog) {
        return <NotFound />;
    }

    if (!blog.component) {
        return <p>loading...</p>;
    }

    return (
        <article class="h-screen lg:pt-4 prose prose-sm">
            <h1 class="not-prose text-4xl font-medium mb-4">{blog.metadata.title}</h1>
            <MDXProvider components={components}>
                <blog.component />
            </MDXProvider>
        </article>
    );
}

export function BlogList() {
    return (
        <div class="w-full place-items-left">
            <ul class="lg:translate-y-1/2">
                {blogs.map((blog) => (
                    <li key={blog.slug}>
                        <a class="group flex gap-1 justify-between items-center" href={`/blog/${blog.slug}`}>
                            <span class="block">{blog.metadata.title}</span>
                            <span class="flex-grow border-b-2 border-dotted"></span>
                            <time class="block text-neutral-500 group-hover:text-neutral-700">{blog.metadata.date}</time>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
