import {z} from 'zod';
import { MAX_FILE_SIZE } from '../constants.js';
import { ACCEPTED_IMAGE_MIME_TYPES } from '../constants.js';

export const imageSchema = z
    .any()
    .refine((files) => {
        return files?.image?.[0]?.size <= MAX_FILE_SIZE;
    }, `Max image size is 5MB.`)
    .refine(
    (files) => ACCEPTED_IMAGE_MIME_TYPES.includes(files?.image?.[0]?.mimetype),
    "Only .jpg, .jpeg, .png and .webp formats are supported."
    )

export const categoryName = z
    .string()
    .max(100, "Must contains 100 characters or less")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Must not contain special characters")

export const categorySchema = z.object({
    name: categoryName,
    description: z.string().max(5000, "Must contains 5000 characters or less").optional(),
    image: imageSchema
}) 