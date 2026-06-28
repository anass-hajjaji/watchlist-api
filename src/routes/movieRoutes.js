import express from 'express';
import { getAllMovies, getMovieById , 
  createMovie, updateMovie, deleteMovie} from '../controllers/movieController.js';
import {authMiddleware} from '../middleware/authmiddleware.js'
import {createMovieSchema, updateMovieSchema} from '../validator/movieValidator.js'
import {validateRequest} from '../middleware/validateRequest.js'
const router = express.Router()

router.get("/", getAllMovies);
router.get("/:movieId", getMovieById);
router.post("/", authMiddleware ,validateRequest(createMovieSchema) ,createMovie);
router.put("/:movieId",authMiddleware, validateRequest(updateMovieSchema), updateMovie);
router.delete("/:movieId", authMiddleware, deleteMovie);

export default router;