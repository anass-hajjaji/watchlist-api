import express from "express";
import { addToWatchlist, removeFromWatchlist, updateWatchlistItem} from "../controllers/watchlistController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { addToWatchlistItemSchema, updateWatchlistItemSchema } from "../validator/watchlistValidator.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router()

router.use(authMiddleware);

router.post("/", validateRequest(addToWatchlistItemSchema), addToWatchlist);
router.delete("/:watchlistId", removeFromWatchlist);
router.put("/:watchlistId", validateRequest(updateWatchlistItemSchema), updateWatchlistItem);

export default router;