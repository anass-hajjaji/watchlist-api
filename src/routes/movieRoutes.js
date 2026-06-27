import express from 'express';
import { getAllMovies, getMovieById } from '../controllers/movieController.js';

const router = express.Router()

router.get("/", getAllMovies);
router.get("/:movieId", getMovieById);
// router.post("/", createMovie);
// router.put("/:movieId", updateMovie);
// router.delete("/:movieId", deleteMovie);

export default router;