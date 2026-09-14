import { prisma } from "../config/db.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";

export const addToWatchlist = catchAsync(async (req, res, next) => {
  const {movieId, status, rating, notes } = req.body;
  // verify movie exists
  const movie = await prisma.movie.findUnique(
  {
    where:{ id : movieId},
  });
  if (!movie)
  {
    return next(AppError(404, "Movie not found"));
  }
  // check if already exist
  const alreadyExist = await prisma.watchlist.findUnique(
  {
    where : { userId_movieId:{
       userId :req.user.id ,
       movieId : movieId,
    }},
  });
  if (alreadyExist)
  {
    return next(AppError(400, "Movie already in the Watchlist."));
  }
  const watchlistItem = await prisma.watchlist.create({
    data : {
      userId : req.user.id ,
      movieId : movieId,
      status : status || "TO_WATCH",
      rating,
      notes,
    }
  });
  return res.status(201).json({
    status : "success",
    data : {
      watchlistItem
    },
  })
});

export const removeFromWatchlist = catchAsync(async (req, res, next) => {
  // find watchlsit item
  const watchlistItem = await prisma.watchlist.findUnique({
    where :{id : req.params.watchlistId}
  })
  if (!watchlistItem){
    return next(AppError(404, "Watchlist Item not found"));
  }
  // check ownership
  if (watchlistItem.userId !== req.user.id)
  {
    return next(AppError(403, "not allowed to delete this whatchlist"));
  }
  await prisma.watchlist.delete({
    where : {id : req.params.watchlistId}
  });

  res.status(200).json({
    status : "success",
    message : "the item removed from the watchlist"
  }); 
});
export const updateWatchlistItem = catchAsync(async (req, res, next) => {
  const { status, rating, notes } = req.body;
  // find watchlsit item
  const watchlistItem = await prisma.watchlist.findUnique({
    where :{id : req.params.watchlistId}
  })
  if (!watchlistItem){
    return next(AppError(404, "Watchlist Item not found"));
  }
  // check ownership
  if (watchlistItem.userId !== req.user.id)
  {
    return next(AppError(403, "not allowed to update this whatchlist"));
  }
  const updatedItem = await prisma.watchlist.update({
    where : {id : req.params.watchlistId},
    data : {
      status,
      rating,
      notes,
    }
  });

  res.status(200).json({
    status : "success",
    data : {
      watchlistItem : updatedItem
    }
  }); 
});