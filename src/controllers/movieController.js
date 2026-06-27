import { prisma } from "../config/db.js";

export const getAllMovies = async (req, res) => {
  try{
    const movies = await prisma.movie.findMany({
      include : {
        creator : {
          select:{ id : true, username : true}
        },
        _count: {
          select : {
            watchlistItems : true
          }
        }
      }
    })
    res.status(200).json({status : "success", movies});    
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getMovieById = async (req, res) => {
  try {
    const movie = await prisma.movie.findUnique({
      where: {id : req.params.movieId},
      include : {
        creator : {
          select:{ id : true, username : true}
        },
        _count: {
          select : {
            watchlistItems : true
          }
        }
      }
    })
    if (!movie) {
     return res.status(404).json({error : "movie not found"});
    }
    res.status(200).json({status: "success", movie});
  } catch(err) {
    res.status(500).json({ error: err.message })
  }
}