import express from 'express';
import { getAllMovies, getMovieById , 
  createMovie, updateMovie, deleteMovie} from '../controllers/movieController.js';
import {authMiddleware, validateUser } from '../middleware/authmiddleware.js'
import {createMovieSchema, updateMovieSchema} from '../validator/movieValidator.js'
import {validateRequest} from '../middleware/validateRequest.js'
const router = express.Router()

router.get("/", getAllMovies);
router.get("/:movieId", getMovieById);
router.post("/", authMiddleware ,validateUser, validateRequest(createMovieSchema) ,createMovie);
router.put("/:movieId",authMiddleware, validateUser, validateRequest(updateMovieSchema), updateMovie);
router.delete("/:movieId", authMiddleware, validateUser, deleteMovie);

export default router;
