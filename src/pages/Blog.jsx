import { MDXProvider } from '@mdx-js/preact';
import { createClient } from '@supabase/supabase-js';
import { useLocation } from 'preact-iso';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { siteTitle } from '../config/site.js';
import { NotFound } from './_404';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

const files = import.meta.glob("../blogs/*.mdx", { eager: true });
const blogs = Object.entries(files).map(([path, mod]) => ({
    slug: path.replace("../blogs/", "").replace(".mdx", ""),
    // @ts-ignore
    metadata: mod.metadata,
    // @ts-ignore
    component: mod.default
})).sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());

const getDisplayTitle = (metadata) => metadata?.header || metadata?.title || "";
const getMetaTitle = (metadata) => metadata?.title || metadata?.header || "";

export function BlogPost() {
    const { path } = useLocation();
    const slug = path.replace("/blog/", "");
    const blog = blogs.find((b) => b.slug == slug);

    useEffect(() => {
        if (!blog || typeof document === "undefined") {
            return;
        }

        const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
        const metaTitle = getMetaTitle(blog.metadata);
        const title = metaTitle ? `${metaTitle} — ${siteTitle}` : `Blog — ${siteTitle}`;
        const description = blog.metadata?.description || title;
        const url = siteUrl ? `${siteUrl}/blog/${blog.slug}` : "";

        document.title = title;

        const upsertMeta = (attribute, key, content) => {
            if (!content) {
                return;
            }
            let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
            if (!element) {
                element = document.createElement("meta");
                element.setAttribute(attribute, key);
                document.head.appendChild(element);
            }
            element.setAttribute("content", content);
        };
        const createMeta = (attribute, key, content) => {
            if (!content) {
                return;
            }
            const element = document.createElement("meta");
            element.setAttribute(attribute, key);
            element.setAttribute("content", content);
            document.head.appendChild(element);
        };

        const upsertLink = (rel, href) => {
            if (!href) {
                return;
            }
            let element = document.head.querySelector(`link[rel="${rel}"]`);
            if (!element) {
                element = document.createElement("link");
                element.setAttribute("rel", rel);
                document.head.appendChild(element);
            }
            element.setAttribute("href", href);
        };

        upsertMeta("name", "description", description);
        upsertLink("canonical", url);
        upsertMeta("property", "og:title", title);
        upsertMeta("property", "og:description", description);
        upsertMeta("property", "og:type", "article");
        upsertMeta("property", "og:url", url);
        upsertMeta("name", "twitter:card", "summary");
        upsertMeta("name", "twitter:title", title);
        upsertMeta("name", "twitter:description", description);
        upsertMeta("name", "twitter:url", url);

        if (blog.metadata?.date) {
            upsertMeta("property", "article:published_time", blog.metadata.date);
        }

        document.head.querySelectorAll('meta[property="article:tag"]').forEach((element) => {
            element.remove();
        });
        (blog.metadata?.tags || []).forEach((tag) => {
            createMeta("property", "article:tag", tag);
        });
    }, [blog]);

    if (!blog) {
        return <NotFound />;
    }

    if (!blog.component) {
        return <p>loading...</p>;
    }

    return (
        <article class="h-screen lg:pt-4 prose prose-sm">
            <h1 class="not-prose text-4xl font-medium mb-4">{getDisplayTitle(blog.metadata)}</h1>
            <MDXProvider>
                <blog.component />
            </MDXProvider>
            <Comments slug={slug} />
        </article>
    );
}

function Comments({ slug }) {
    const [comments, setComments] = useState([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [website, setWebsite] = useState("");
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const canUseSupabase = useMemo(() => !!supabase, []);

    useEffect(() => {
        let isMounted = true;

        async function loadComments() {
            if (!canUseSupabase) {
                setError("Comments are not configured.");
                setLoading(false);
                return;
            }

            const { data, error: loadError } = await supabase
                .from("comments")
                .select("id, post_slug, name, body, created_at")
                .eq("post_slug", slug)
                .order("created_at", { ascending: false });

            if (!isMounted) {
                return;
            }

            if (loadError) {
                setError(loadError.message);
            } else {
                setComments(data ?? []);
            }
            setLoading(false);
        }

        loadComments();

        return () => {
            isMounted = false;
        };
    }, [slug, canUseSupabase]);

    async function handleSubmit(event) {
        event.preventDefault();
        if (!name.trim() || !body.trim() || !canUseSupabase) {
            return;
        }

        if (website.trim()) {
            return;
        }

        const lastSubmitAt = Number(localStorage.getItem("comments:lastSubmitAt") || 0);
        const now = Date.now();
        if (now - lastSubmitAt < 30000) {
            setError("Please wait a bit before posting again.");
            return;
        }

        setSubmitting(true);
        setError("");

        const payload = {
            post_slug: slug,
            name: name.trim(),
            body: body.trim()
        };

        if (email.trim()) {
            payload.email = email.trim();
        }

        const { data, error: insertError } = await supabase
            .from("comments")
            .insert(payload)
            .select("id, post_slug, name, body, created_at")
            .single();

        if (insertError) {
            setError(insertError.message);
        } else if (data) {
            setComments((current) => [data, ...current]);
            setBody("");
            setWebsite("");
            localStorage.setItem("comments:lastSubmitAt", String(now));
        }

        setSubmitting(false);
    }

    return (
        <section class={`not-prose mt-12 border-t border-neutral-200 pt-4 text-base ${comments.length ? "pb-8" : "pb-4"}`}>
            <h2 class="text-base font-medium mb-3">comments ({comments.length})</h2>
            <form class="grid gap-3 mb-5" onSubmit={handleSubmit}>
                <label class="grid gap-1 text-sm">
                    <span class="text-neutral-600">name</span>
                    <input
                        class="border border-neutral-300 bg-white px-3 py-2 focus:outline-none focus:border-neutral-500"
                        value={name}
                        onInput={(event) => setName(event.currentTarget.value)}
                        placeholder="jane doe"
                        required
                    />
                </label>
                <label class="grid gap-1 text-sm">
                    <span class="text-neutral-600">email (optional)</span>
                    <input
                        class="border border-neutral-300 bg-white px-3 py-2 focus:outline-none focus:border-neutral-500"
                        value={email}
                        onInput={(event) => setEmail(event.currentTarget.value)}
                        placeholder="jane@example.com"
                        type="email"
                    />
                </label>
                <label class="hidden">
                    <span>Website</span>
                    <input
                        value={website}
                        onInput={(event) => setWebsite(event.currentTarget.value)}
                        tabIndex={-1}
                        autoComplete="off"
                    />
                </label>
                <label class="grid gap-1 text-sm">
                    <span class="text-neutral-600">comment</span>
                    <textarea
                        class="border border-neutral-300 bg-white px-3 py-2 min-h-[120px] focus:outline-none focus:border-neutral-500"
                        value={body}
                        onInput={(event) => setBody(event.currentTarget.value)}
                        placeholder="share your thoughts..."
                        required
                    />
                </label>
                <button
                    class="w-fit text-sm text-neutral-600 underline decoration-neutral-400 hover:decoration-neutral-600 disabled:opacity-60"
                    type="submit"
                    disabled={submitting || !canUseSupabase}
                >
                    {submitting ? "posting..." : "post comment"}
                </button>
            </form>
            {error && <p class="text-sm text-red-600 mb-3">{error}</p>}
            {loading && <p class="text-sm text-neutral-500">loading comments...</p>}
            <div class="grid gap-4">
                {comments.map((comment) => (
                    <article key={comment.id} class="border-t border-neutral-200 pt-3">
                        <div class="flex items-center justify-between text-xs text-neutral-500 mb-2">
                            <span class="font-medium text-neutral-700">{comment.name}</span>
                            <time>{new Date(comment.created_at).toLocaleDateString()}</time>
                        </div>
                        <p class="text-sm whitespace-pre-wrap text-neutral-800">{comment.body}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}

export function BlogList() {
    useEffect(() => {
        if (typeof document === "undefined") {
            return;
        }
        document.title = `Blog — ${siteTitle}`;
    }, []);

    const [query, setQuery] = useState("");
    const [selectedTags, setSelectedTags] = useState([]);
    const normalizedQuery = query.trim().toLowerCase();
    const allTags = useMemo(() => {
        const tags = new Set();
        blogs.forEach((blog) => {
            (blog.metadata?.tags || []).forEach((tag) => tags.add(tag));
        });
        return Array.from(tags).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    }, []);
    const normalizedSelectedTags = useMemo(
        () => selectedTags.map((tag) => tag.toLowerCase()),
        [selectedTags]
    );
    const filteredBlogs = useMemo(() => {
        return blogs.filter((blog) => {
            if (normalizedSelectedTags.length) {
                const blogTags = (blog.metadata?.tags || []).map((tag) => tag.toLowerCase());
                const matchesTags = normalizedSelectedTags.some((tag) => blogTags.includes(tag));
                if (!matchesTags) {
                    return false;
                }
            }
            if (!normalizedQuery) {
                return true;
            }
            const title = getDisplayTitle(blog.metadata).toLowerCase();
            const slug = blog.slug.toLowerCase();
            const date = blog.metadata?.date?.toLowerCase?.() || "";
            return title.includes(normalizedQuery)
                || slug.includes(normalizedQuery)
                || date.includes(normalizedQuery);
        });
    }, [normalizedQuery, normalizedSelectedTags]);

    return (
        <div class="w-full lg:h-screen lg:grid lg:grid-rows-2">
            <div class="lg:flex lg:items-end pb-1">
                <div class="w-full grid gap-2">
                    <div class="flex items-end gap-3">
                        <label class="block w-full">
                            <span class="sr-only">search</span>
                            <input
                                class="box-border h-8 w-full border-0 border-b border-neutral-300 bg-transparent px-0 text-sm leading-10 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
                                type="search"
                                placeholder="search"
                                value={query}
                                onInput={(event) => setQuery(event.currentTarget.value)}
                            />
                        </label>
                    </div>
                    {!!allTags.length && (
                        <div class="flex flex-wrap gap-2 text-xs text-neutral-600">
                            {allTags.map((tag) => {
                                const isSelected = selectedTags.includes(tag);
                                return (
                                    <button
                                        key={tag}
                                        type="button"
                                        class={`touch-manipulation rounded-full border px-2 py-0.5 transition-colors duration-75 ${isSelected ? "border-neutral-900 text-neutral-900" : "border-neutral-300 hover:border-neutral-500"}`}
                                        aria-pressed={isSelected}
                                        onClick={() => {
                                            setSelectedTags((current) => (
                                                current.includes(tag)
                                                    ? current.filter((value) => value !== tag)
                                                    : [...current, tag]
                                            ));
                                        }}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                            {!!selectedTags.length && (
                                <button
                                    type="button"
                                    class="text-neutral-400 hover:text-neutral-600"
                                    onClick={() => setSelectedTags([])}
                                >
                                    clear
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div class="lg:flex lg:items-start">
                <ul class="w-full">
                    {filteredBlogs.map((blog) => (
                        <li key={blog.slug}>
                            <a
                                class="group -mx-2 block rounded-md px-2 py-1 transition-colors hover:bg-neutral-100"
                                href={`/blog/${blog.slug}`}
                            >
                                <div class="flex items-start justify-between gap-3">
                                    <div class="flex flex-col gap-1">
                                        <span class="block">{getDisplayTitle(blog.metadata)}</span>
                                        <span class="text-xs text-neutral-500">
                                            {(blog.metadata?.tags || [])
                                                .slice()
                                                .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
                                                .join(", ")}
                                        </span>
                                    </div>
                                    <time class="block text-sm text-neutral-500 group-hover:text-neutral-700">{blog.metadata.date}</time>
                                </div>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
