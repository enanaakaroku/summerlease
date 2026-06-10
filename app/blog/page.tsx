import Link from "next/link";
import { getAllBlogPosts } from "@/lib/blog";

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-white">
      <h1 className="mb-10 text-4xl font-bold">Blog</h1>

      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
          >
            <div className="mb-2 text-sm text-white/50">{post.date}</div>

            <h2 className="text-2xl font-semibold">{post.title}</h2>

            {post.description && (
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                {post.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </main>
  );
}
