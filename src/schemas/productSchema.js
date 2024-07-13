import {z} from 'zod';
import { MAX_FILE_SIZE } from '../constants.js';
import { ACCEPTED_IMAGE_MIME_TYPES } from '../constants.js';

export const specificationSchema = z.array(z.object({
  name: z.string().min(1, "Name is required").max(30, "Name must be 30 characters or less"),
  value: z.string().min(1, "Value is required").max(30, "Value must be 30 characters or less"),
})).min(1, "Specification is required").max(10, "No more than 10 specification allowed");

export const nameSchema = z
  .string()
  .max(255, "Product name must be 255 characters or less")
  .regex(/^[a-zA-Z0-9\s\-_]+$/, "Product name must not contain special characters");

export const descriptionSchema = z.string().max(3000, "Description must be 3000 characters or less")

export const featuresSchema = z.array(z.string().min(1, "Feature is required").max(10, "No more than 10 features allowed"));

export const priceSchema = z.number().positive("Price must be a positive number").min(0.01, "Price must be greater than zero");

export const unitsSoldSchema = z.number().int("Units sold must be an integer").positive("Units sold must be positive").default(0).optional();

export const stockSchema =z.number().int("Stock must be an integer").positive("Stock must be positive").default(0);

export const ImageArraySchema = z
  .any()
  .refine((files) => {
    console.log(files);
  if (files['image1'] && files?.image1[0].size > MAX_FILE_SIZE) {
      return false;
  }
  if (files['image2'] != null && files?.image2[0].size > MAX_FILE_SIZE) {
      return false;
  }
  if (files['image3'] != null && files?.image3[0].size > MAX_FILE_SIZE) {
      return false;
  }
  return true;
}, `Max image size is 5MB for each image.`)
.refine((files) => {
  if (files['image1'] && !ACCEPTED_IMAGE_MIME_TYPES.includes(files?.image1[0].mimetype)) {
      return false;
  }
  if (files['image2'] != null && !ACCEPTED_IMAGE_MIME_TYPES.includes(files?.image2[0].mimetype)) {
      return false;
  }
  if (files['image3'] != null && !ACCEPTED_IMAGE_MIME_TYPES.includes(files?.image3[0].mimetype)) {
      return false;
  }
  return true;
}, "Only .jpg, .jpeg, .png, and .webp formats are supported for each image.");

export const offerSchema = z.number().nullable().default(null).optional();

export const ratingsReviewsSchema = z.array(
  z.object({
    review: z.string().min(1, "Review is required"),
    user: z.string(),
    rating: z.number().positive("Rating must be a positive number").min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
    createdAt: z.date().default(() => new Date()),
  })
).optional();

  export const ProductSchema = z.object({
    name: nameSchema,
    description: descriptionSchema,
    features: featuresSchema,
    specifications: specificationSchema,
    price: priceSchema,
    unitsSold: unitsSoldSchema,
    stock: stockSchema,
    images: ImageArraySchema,
    offer: offerSchema,
    ratingsReviews: ratingsReviewsSchema
  });
  