import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getBlogPostBySlug, getBlogSlugs } from "@/lib/blog";

type BlogDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  const slugs = getBlogSlugs();

  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: BlogDetailPageProps) {
  const { slug } = await params;

  try {
    const post = getBlogPostBySlug(slug);

    return {
      title: post.meta.title,
      description: post.meta.description,
    };
  } catch {
    return {
      title: "文章不存在",
    };
  }
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;

  let post;

  try {
    post = getBlogPostBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-white">
      <article>
        <header className="mb-10">
          <div className="mb-3 text-sm text-white/50">{post.meta.date}</div>

          <h1 className="text-4xl font-bold tracking-tight">
            {post.meta.title}
          </h1>

          {post.meta.description && (
            <p className="mt-4 text-white/60">{post.meta.description}</p>
          )}
        </header>

        <div className="prose prose-invert max-w-none">
          <MDXRemote source={post.content} />
        </div>
      </article>
    </main>
  );
}
