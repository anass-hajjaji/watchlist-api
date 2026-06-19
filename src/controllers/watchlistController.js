import { prisma } from "../config/db.js";

export const addToWatchlist = async (req, res) => {
  try {
   
    const {movieId, status, rating, notes } = req.body;
    // verify movie exists
    const movie = await prisma.movie.findUnique(
    {
      where:{ id : movieId},
    });
    if (!movie)
    {
      return res.status(404).json({error : "Movie not found"})
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
      return res.status(400).json({error : "Movie already in the Watchlist."})
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
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return res.status(500).json({error : "Internal server error"})
  }
}

export const removeFromWatchlist = async (req, res) => {
  // find watchlsit item
  const watchlistItem = await prisma.watchlist.findUnique({
    where :{id : req.params.movieId}
  })
  if (!watchlistItem){
    return res.status(404).json({error : "Watchlist Item not found"});
  }
  // check ownership
  if (watchlistItem.userId !== req.user.id)
  {
    return res.status(403)
    .json({error : "not allowed to update this whatchlist"});
  }
  await prisma.watchlist.delete({
    where : {id : req.params.movieId}
  });

  res.status(200).json({
    status : "success",
    message : "the item removed from the watchlist"
  }); 
}

export const updateWatchlistItem = async (req, res) => {
  const { status, rating, notes } = req.body;
  // find watchlsit item
  const watchlistItem = await prisma.watchlist.findUnique({
    where :{id : req.params.movieId}
  })
  if (!watchlistItem){
    return res.status(404).json({error : "Watchlist Item not found"});
  }
  // check ownership
  if (watchlistItem.userId !== req.user.id)
  {
    return res.status(403)
    .json({error : "not allowed to update this whatchlist"});
  }
  const updatedItem = await prisma.watchlist.update({
    where : {id : req.params.movieId},
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
}