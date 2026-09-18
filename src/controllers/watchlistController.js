import { prisma } from "../config/db.js";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import {clearHashCache} from '../utils/chache.js'

export const addToWatchlist = catchAsync(async (req, res, next) => {
  const {movieId, status, rating, notes } = req.body;
  // verify movie exists
  const movie = await prisma.movie.findUnique(
  {
    where:{ id : movieId},
  });
  if (!movie)
  {
    return next(new AppError("Movie not found", 404));
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
    return next(new AppError("Movie already in the Watchlist.", 400));
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

  await clearHashCache("/movies");

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
    return next(new AppError("Watchlist Item not found", 404));
  }
  // check ownership
  if (watchlistItem.userId !== req.user.id)
  {
    return next(new AppError("not allowed to delete this whatchlist", 403));
  }
  await prisma.watchlist.delete({
    where : {id : req.params.watchlistId}
  });

  await clearHashCache("/movies");

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
    return next(new AppError("Watchlist Item not found", 404));
  }
  // check ownership
  if (watchlistItem.userId !== req.user.id)
  {
    return next(new AppError("not allowed to update this whatchlist", 403));
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