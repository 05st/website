import { MDXProvider } from '@mdx-js/preact';
import { useLocation } from 'preact-iso';
import { useEffect, useState } from 'preact/hooks';
import { NotFound } from './_404';

const blogs = [];

const modules = import.meta.glob('../blogs/*.mdx');
for (const path in modules) {
    blogs.push({
        slug: path.replace('../blogs/', '').replace('.mdx', ''),
        component: modules[path]
    });
}

const components= {
    em(properties) {
        return <i {...properties} />;
    }
}

export function BlogPost() {
    const { path } = useLocation();
    const slug = path.replace('/blog/', '');
    const blog = blogs.find((b) => b.slug == slug);

    if (!blog) {
        return <NotFound />;
    }

    const [Content, setContent] = useState(null);
    useEffect(() => blog.component().then((mod) => setContent(() => mod.default)), [slug]);

    if (!Content) {
        return <p>loading...</p>;
    }

    return (
        <article>
            <MDXProvider components={components}>
                <Content />
            </MDXProvider>
        </article>
    );
}

export function BlogList() {
    return (
        <div class="w-full place-items-left">
            <ul>
                {blogs.map((blog) => (
                    <li key={blog.slug}>
                        <a href={`/blog/${blog.slug}`}>
                            {blog.slug}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
