import {z} from "zod";

export const createMovieSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  overview: z.string().optional(),
  releaseYear: z.number()
    .int('Release year must be a whole number')
    .min(1888, 'Invalid release year')
    .max(new Date().getFullYear(), 'Release year cannot be in the future')
    .optional(),
  genres: z.array(z.string()).optional(),
  runtime: z.number().int().positive('Runtime must be a positive number').optional(),
  posterUrl: z.string().url('Poster must be a valid URL').optional(),
});

// export const updateMovieSchema = z.object({
//   title: z.string().min(1, 'Title is required').optional(),
//   overview: z.string().optional(),
//   releaseYear: z.number()
//     .int('Release year must be a whole number')
//     .min(1888, 'Invalid release year')
//     .max(new Date().getFullYear(), 'Release year cannot be in the future')
//     .optional(),
//   genres: z.array(z.string()).optional(),
//   runtime: z.number().int().positive('Runtime must be a positive number').optional(),
//   posterUrl: z.string().url('Poster must be a valid URL').optional(),
// })

export const updateMovieSchema = createMovieSchema.partial();