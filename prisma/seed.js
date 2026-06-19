// import {prisma} from '../src/config/db.js';
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const creatorId = "c9040975-282b-4859-a9f0-7e4580526eb8";

const movies = [
  {
  title: "Inception",
  overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
  releaseYear: 2010,
  genres: ["Sci-Fi"],
  createdBy: creatorId,
},
{
  title: "The Dark Knight",
  overview: "When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham. The Dark Knight must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
  releaseYear: 2008,
  genres: ["Action", "Crime", "Drama"],
  createdBy: creatorId,
},
{
  title: "Interstellar",
  overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
  releaseYear: 2014,
  genres: ["Adventure", "Drama", "Sci-Fi"],
  createdBy: creatorId,
}, 
{ 
  title: "The Matrix",
  overview: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
  releaseYear: 1999,
  genres: ["Action", "Sci-Fi"],
  createdBy: creatorId,
},
{
  title: "Pulp Fiction",
  overview: "The lives of two mob hitmen, a boxer, a gangster's wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
  releaseYear: 1994,
  genres: ["Crime", "Drama"],
  createdBy: creatorId,
}
];

async function main() {
  console.log("Seeding movies...");
  for (const movie of movies) {
    await prisma.movie.create({
      data: movie,
    });
    console.log(`Seeded movie: ${movie.title}`);
  }
  console.log("Movies seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });