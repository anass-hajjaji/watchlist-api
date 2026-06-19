import {z} from "zod";

export const addToWatchlistItemSchema = z.object({
  movieId : z.string().min(1, "Movie ID is required"),
  status : z.enum(["TO_WATCH", "WATCHING", "WATCHED"]).optional(),
  rating : z.number().min(0, "Rating must be a positive number")
  .max(10, "Rating must be a number between 0 and 10")
  .optional(),
  notes : z.string().optional(),
})


export const updateWatchlistItemSchema = z.object({
  status : z.enum(["TO_WATCH", "WATCHING", "WATCHED"]).optional(),
  rating : z.number().min(0, "Rating must be a positive number")
  .max(10, "Rating must be a number between 0 and 10")
  .optional(),
  notes : z.string().optional(),
})