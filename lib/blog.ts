import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export type BlogMeta = {
  title: string;
  date: string;
  description?: string;
  slug: string;
};

export type BlogPost = {
  meta: BlogMeta;
  content: string;
};

export function getBlogSlugs() {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((fileName) => fileName.endsWith(".mdx"))
    .map((fileName) => fileName.replace(/\.mdx$/, ""));
}

export function getBlogPostBySlug(slug: string): BlogPost {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  const fileContent = fs.readFileSync(filePath, "utf8");

  const { data, content } = matter(fileContent);

  return {
    meta: {
      title: String(data.title ?? slug),
      date: String(data.date ?? ""),
      description: data.description ? String(data.description) : undefined,
      slug,
    },
    content,
  };
}

export function getAllBlogPosts(): BlogMeta[] {
  return getBlogSlugs()
    .map((slug) => getBlogPostBySlug(slug).meta)
    .sort((a, b) => b.date.localeCompare(a.date));
}
