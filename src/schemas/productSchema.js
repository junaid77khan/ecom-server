import { z } from 'zod';

const specificationSchema = z.object({
  name: z.string().min(1, "Name is required").max(30, "Name must be 30 characters or less"),
  value: z.string().min(1, "Value is required").max(30, "Value must be 30 characters or less"),
});

export const productName = z
  .string()
  .max(255, "Product name must be 255 characters or less")
  .regex(/^[a-zA-Z0-9\s\-_]+$/, "Product name must not contain special characters");


  export const ProductSchema = z.object({
    name: productName,
    description: z.string().max(3000, "Description must be 3000 characters or less"),
    features: z.array(z.string().min(1, "Feature is required").max(10, "No more than 10 features allowed")),
    specifications: z.array(specificationSchema).min(1, "At least one specification is required").max(10, "No more than 10 specifications allowed"),
    price: z.number().positive("Price must be a positive number").min(0.01, "Price must be greater than zero"),
    unitsSold: z.number().int("Units sold must be an integer").positive("Units sold must be positive").default(0).optional(),
    stock: z.number().int("Stock must be an integer").positive("Stock must be positive").default(0),
    images: z.array(z.string()).min(3, "At least 3 images are required").max(3, "No more than 3 images allowed"),
    offer: z.number().nullable().default(null).optional(),
    ratingsReviews: z.array(
      z.object({
        review: z.string().min(1, "Review is required"),
        user: z.string(),
        rating: z.number().positive("Rating must be a positive number").min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
        createdAt: z.date().default(() => new Date()),
      })
    ).optional(),
    availability: z.boolean().default(true),
  });
  