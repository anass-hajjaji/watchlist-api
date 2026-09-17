import { prisma } from "../config/db.js";
import { catchAsync } from "../utils/catchAsync.js";
import AppError  from "../utils/appError.js";
import redisClient from "../config/redis.js";

export const getAllMovies = catchAsync(async (req, res, next) => {
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

  const responsePayload = {
    status: 'success',
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / take),
    movies
  };

  // Save a stringified copy of that package to Redis
  const cacheKey = req.originalUrl;
  await redisClient.setEx(cacheKey, 3600, JSON.stringify(responsePayload));

  //Send the package to the user
  res.status(200).json(responsePayload);
})

export const getMovieById = catchAsync(async (req, res, next) => {
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
     return next(new AppError("the movie is not found", 404));
    }
    res.status(200).json({status: "success", movie});
})

export const createMovie = catchAsync(async (req, res, next) => {
    const { title, overview, releaseYear, genres, runtime, posterUrl } = req.body;
    const movie  = await prisma.movie.findFirst({
      where: { title, releaseYear }
    })
    if (movie) {
      return next(new AppError("movie already exists", 409));
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
})

export const updateMovie = catchAsync(async (req, res, next) => {
  // check if the movie exist
  const movie = await prisma.movie.findUnique({
    where :{id : req.params.movieId}
  })
  if (!movie) {
    return next(new AppError("the movie is not found", 404));
  }
  const { title, overview, releaseYear, genres, runtime, posterUrl } = req.body;
  if ( movie.createdBy !== req.user.id) {
    return next(new AppError("you are not authorized to update this movie", 403));
  }
  
  const updatedData = {};
  if (title !== undefined) updatedData.title = title;
  if (overview !== undefined) updatedData.overview = overview;
  if (releaseYear !== undefined) updatedData.releaseYear = releaseYear;
  if (genres !== undefined) updatedData.genres = genres;
  if (runtime !== undefined) updatedData.runtime = runtime;
  if (posterUrl !== undefined) updatedData.posterUrl = posterUrl;

  const updatedMovie = await prisma.movie.update({
    where : {id : req.params.movieId},
      data: updatedData,
  })
  res.status(200).json({status : "success", movie : updatedMovie});
})

export const deleteMovie = catchAsync(async (req, res, next) =>{
    const movie = await prisma.movie.findUnique({
      where :{id : req.params.movieId}
    })
    if (!movie) {
      return next(new AppError("the movie is not found", 404));
    }
    if ( movie.createdBy !== req.user.id) {
      return next(new AppError("you are not authorized to delete this movie", 403));
    }
      await prisma.movie.delete({
        where : {id : req.params.movieId}
      })
    res.status(200).json({
      status : "success",
      message : `the movie : ${movie.title} is deleted succefully`
    })
})

// the basic get all movies function without filters, sorting, and pagination
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