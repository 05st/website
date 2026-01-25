import { MDXProvider } from '@mdx-js/preact';
import { createClient } from '@supabase/supabase-js';
import { useLocation } from 'preact-iso';
import { useEffect, useMemo, useState } from 'preact/hooks';
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
    return (
        <div class="w-full place-items-left">
            <ul class="lg:translate-y-1/2">
                {blogs.map((blog) => (
                    <li key={blog.slug}>
                        <a class="group flex gap-1 justify-between items-center" href={`/blog/${blog.slug}`}>
                            <span class="block">{blog.metadata.title}</span>
                            <span class="flex-grow border-b-2 border-dotted"></span>
                            <time class="block text-sm text-neutral-500 group-hover:text-neutral-700">{blog.metadata.date}</time>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
