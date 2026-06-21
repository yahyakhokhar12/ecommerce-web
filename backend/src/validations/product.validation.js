import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(200),
    description: z.string().min(10).max(5000),
    shortDescription: z.string().max(300).optional(),
    category: z.string().min(1, 'Category required'),
    brand: z.string().min(1),
    sku: z.string().optional(),
    price: z.coerce.number().positive(),
    discount: z.coerce.number().min(0).max(100).optional(),
    stock: z.coerce.number().int().min(0),
    tags: z.array(z.string()).optional(),
    features: z.array(z.string()).optional(),
    isFeatured: z
      .preprocess((value) => value === true || value === 'true', z.boolean())
      .optional(),
  }),
});
