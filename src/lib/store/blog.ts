/**
 * Opslag voor automatisch gegenereerde blogs (KV-lijst; in-memory zonder KV).
 * Een cron (/api/cron/blog) schrijft er elke paar dagen een nieuwe klus-blog in;
 * de adviespagina toont ze onderaan.
 */

import { isKvEnabled, kvLPush, kvLTrim, kvLRange } from "./kv";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  /** Markdown-achtige body (alinea's gescheiden door lege regels). */
  body: string;
  category: string;
  date: string;
}

const KEY = "blog:posts";
const MAX = 60;
const mem: BlogPost[] = [];

export async function saveBlogPost(post: BlogPost): Promise<void> {
  mem.unshift(post);
  if (mem.length > MAX) mem.length = MAX;
  if (isKvEnabled()) {
    await kvLPush(KEY, post);
    await kvLTrim(KEY, 0, MAX - 1);
  }
}

export async function listBlogPosts(limit = MAX): Promise<BlogPost[]> {
  if (isKvEnabled()) {
    const kv = await kvLRange<BlogPost>(KEY, 0, limit - 1);
    if (kv.length) return kv;
  }
  return mem.slice(0, limit);
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  const posts = await listBlogPosts();
  return posts.find((p) => p.slug === slug);
}
