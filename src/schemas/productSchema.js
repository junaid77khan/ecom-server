import { z } from 'zod';

const specificationSchema = z.object({
  name: z.string().min(1, "required").max(30, "Must contains 30 characters or less"),
  value: z.string().min(1, "required").max(30, "Must contains 30 characters or less"),
});

export const productName = z
    .string()
    .max(100, "Must contains 100 characters or less")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Must not contain special characters")

export const ProductSchema = z.object({
    name: productName,
    description: z.string().max(5000, "Must contains 5000 characters or less").optional(),
    features: z.array(z.string().min(1, "required").max(30, "Must contains 30 characters or less")).optional(),
    specifications: z.array(specificationSchema).optional(),
    price: z.number().positive(),
    unitsSold: z.number().int().positive().default(0).optional(),
    stock: z.number().int().positive().default(0),
    category: z.string().optional(),
    images: z.array(z.string()).min(1).max(3),
    offer: z.number().nullable().default(null).optional(),
    ratingsReviews: z.array(
      z.object({
        review: z.string().min(1, "required"),
        user: z.string(), // Assuming user ID is a string
        rating: z.number().positive().min(1).max(5),
        createdAt: z.date().default(() => new Date()),
      })
    ).optional(),
    availability: z.boolean().default(true),
  });