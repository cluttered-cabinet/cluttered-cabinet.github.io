import { defineCollection, z } from 'astro:content';

const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    summary: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    toc: z.boolean().optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = {
  posts: postsCollection,
};
