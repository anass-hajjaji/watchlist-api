import { prisma } from "../config/db.js";

// export const getAllMovies = async (req, res) => {
//   try{
//     const movies = await prisma.movie.findMany({
//       include : {
//         creator : {
//           select:{ id : true, username : true}
//         },
//         _count: {
//           select : {
//             watchlistItems : true
//           }
//         }
//       }
//     })
//     res.status(200).json({status : "success", movies});    
//   } catch (err) {
//     res.status(500).json({ err: err.message })
//   }
// }

export const getAllMovies = async (req, res) => {
  try {
    const { q, genre, year, sort, page = 1, limit = 10 } = req.query
    
    const where = {} // build filter object
    if (q) where.title = { contains: q, mode: 'insensitive' }
    if (genre) where.genres = { has: genre }
    if (year) where.releaseYear = parseInt(year)
    // build sort object
    const orderBy = {}
    if (sort === 'runtime') orderBy.runtime = 'asc'
    else if (sort === 'year') orderBy.releaseYear = 'desc'
    else if (sort === 'title') orderBy.title = 'asc'
    else orderBy.createdAt = 'desc'
    
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const take = parseInt(limit)
    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          creator: {
            select: { id: true, username: true }
          },
          _count: {
            select: { watchlistItems: true }
          }
        }
      }),
      prisma.movie.count({ where })
    ])

    res.status(200).json({
      status: 'success',
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / take),
      movies
    })
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
     return res.status(404).json({err : "movie not found"});
    }
    res.status(200).json({status: "success", movie});
  } catch(err) {
    res.status(500).json({ err: err.message })
  }
}

export const createMovie = async (req, res) => {
  try {
    const { title, overview, releaseYear, genres, runtime, posterUrl } = req.body;
    const movie  = await prisma.movie.findFirst({
      where: { title, releaseYear }
    })
    if (movie) {
      return res.status(409).json({err : "movie already exists"});
    }
    const newMovie = await prisma.movie.create({
      data: {
        title,
        overview,
        releaseYear,
        genres,
        runtime,
        posterUrl,
        createdBy : req.user.id
      },
    });
    res.status(201).json({status: "success", movie: newMovie});
  } catch (err) {
    res.status(500).json({ err: err.message })
  }
}

export const updateMovie = async (req, res) => {
  // check if the movie exist
  try {
  const movie = await prisma.movie.findUnique({
    where :{id : req.params.movieId}
  })
  if (!movie) {
    return res.status(404).json({err : "the movie is not found"});
  }
  const { title, overview, releaseYear, genres, runtime, posterUrl } = req.body;
  if ( movie.createdBy !== req.user.id) {
    return res.status(403).json({err : "you are not authorized to update this movie"});
  }
  const updatedMovie = await prisma.movie.update({
    where : {id : req.params.movieId},
      data: {
        ...(title !== undefined && { title }),
        ...(overview !== undefined && { overview }),
        ...(releaseYear !== undefined && { releaseYear }),
        ...(genres !== undefined && { genres }),
        ...(runtime !== undefined && { runtime }),
        ...(posterUrl !== undefined && { posterUrl }),
      }
  })
  res.status(200).json({status : "success", movie : updatedMovie});
  } catch (err) {
    res.status(500).json({ err: err.message })
  }
}

export const deleteMovie = async (req, res) =>{
  try {
    const movie = await prisma.movie.findUnique({
      where :{id : req.params.movieId}
    })
    if (!movie) {
      return res.status(404).json({err : "the movie is not found"});
    }
    if ( movie.createdBy !== req.user.id) {
      return res.status(403).json({err : "you are not authorized to delete this movie"});
    }
      await prisma.movie.delete({
        where : {id : req.params.movieId}
      })
    res.status(200).json({
      status : "success",
      message : `the movie : ${movie.title} is deleted succefully`
    })
  } catch (err){
        res.status(500).json({ err: err.message })
  }
}