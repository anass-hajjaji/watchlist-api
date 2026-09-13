import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const creatorId = "7ed2eed0-15d5-4013-85ae-73ab7fa2f1a5";

// A base collection of real movies
const realMoviesBase = [
  { title: "The Shawshank Redemption", overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.", releaseYear: 1994, runtime: 142, genres: ["Drama"] },
  { title: "The Godfather", overview: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant youngest son.", releaseYear: 1972, runtime: 175, genres: ["Crime", "Drama"] },
  { title: "The Dark Knight", overview: "When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham.", releaseYear: 2008, runtime: 152, genres: ["Action", "Crime", "Drama"] },
  { title: "12 Angry Men", overview: "The defense and the prosecution have rested and the jury is filing into the jury room to decide if a young Spanish-American is guilty or innocent.", releaseYear: 1957, runtime: 96, genres: ["Drama"] },
  { title: "Schindler's List", overview: "In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce.", releaseYear: 1993, runtime: 195, genres: ["Biography", "Drama", "History"] },
  { title: "The Lord of the Rings: The Return of the King", overview: "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom.", releaseYear: 2003, runtime: 201, genres: ["Adventure", "Fantasy", "Drama"] },
  { title: "Pulp Fiction", overview: "The lives of two mob hitmen, a boxer, a gangster's wife, and a pair of diner bandits intertwine in four tales of violence and redemption.", releaseYear: 1994, runtime: 154, genres: ["Crime", "Drama"] },
  { title: "The Lord of the Rings: The Fellowship of the Ring", overview: "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth.", releaseYear: 2001, runtime: 178, genres: ["Adventure", "Fantasy", "Drama"] },
  { title: "The Good, the Bad and the Ugly", overview: "A bounty hunting scam joins two men in an uneasy alliance against a third in a race to find a fortune in buried gold.", releaseYear: 1966, runtime: 161, genres: ["Western"] },
  { title: "Forrest Gump", overview: "The presidencies of Kennedy and Johnson, the Vietnam War, and other historical events unfold from the perspective of an Alabama man.", releaseYear: 1994, runtime: 142, genres: ["Drama", "Romance"] },
  { title: "Fight Club", overview: "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into something much more.", releaseYear: 1999, runtime: 139, genres: ["Drama"] },
  { title: "Inception", overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.", releaseYear: 2010, runtime: 148, genres: ["Action", "Adventure", "Sci-Fi"] },
  { title: "The Matrix", overview: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.", releaseYear: 1999, runtime: 136, genres: ["Action", "Sci-Fi"] },
  { title: "Goodfellas", overview: "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners.", releaseYear: 1990, runtime: 146, genres: ["Biography", "Crime", "Drama"] },
  { title: "Interstellar", overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.", releaseYear: 2014, runtime: 169, genres: ["Adventure", "Drama", "Sci-Fi"] },
  { title: "Se7en", overview: "Two detectives, a veteran and a rookie, hunt a serial killer who uses the seven deadly sins as his motives.", releaseYear: 1995, runtime: 127, genres: ["Crime", "Drama", "Mystery"] },
  { title: "The Silence of the Lambs", overview: "A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to catch another serial killer.", releaseYear: 1991, runtime: 118, genres: ["Crime", "Drama", "Thriller"] },
  { title: "City of God", overview: "In the slums of Rio, two kids paths diverge as one grows up to be a photographer, and the other a kingpin.", releaseYear: 2002, runtime: 130, genres: ["Crime", "Drama"] },
  { title: "Spirited Away", overview: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.", releaseYear: 2001, runtime: 125, genres: ["Animation", "Adventure", "Fantasy"] },
  { title: "Saving Private Ryan", overview: "Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines to retrieve a paratrooper whose brothers have been killed.", releaseYear: 1998, runtime: 169, genres: ["Drama", "War"] },
  { title: "Parasite", overview: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.", releaseYear: 2019, runtime: 132, genres: ["Drama", "Thriller", "Comedy"] },
  { title: "Whiplash", overview: "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor.", releaseYear: 2014, runtime: 106, genres: ["Drama", "Music"] },
  { title: "The Prestige", overview: "After a tragic accident, two stage magicians in 1890s London engage in a battle to create the ultimate illusion.", releaseYear: 2006, runtime: 130, genres: ["Drama", "Mystery", "Sci-Fi"] },
  { title: "The Departed", overview: "An undercover cop and a mole in the police attempt to identify each other while infiltrating an Irish gang in South Boston.", releaseYear: 2006, runtime: 151, genres: ["Crime", "Drama", "Thriller"] },
  { title: "Gladiator", overview: "A former Roman general sets out to exact vengeance against the corrupt emperor who murdered his family.", releaseYear: 2000, runtime: 155, genres: ["Action", "Adventure", "Drama"] }
];

async function main() {
  console.log("Seeding 100 real movies...");

  const moviesToInsert = [];
  
  // Loops 4 times (25 movies * 4 = 100 entries)
  // Appends a small edition marker to duplicate titles to keep them unique
  for (let i = 0; i < 4; i++) {
    realMoviesBase.forEach((movie) => {
      const uniqueTitle = i === 0 ? movie.title : `${movie.title} (Edition ${i + 1})`;
      
      moviesToInsert.push({
        title: uniqueTitle,
        overview: movie.overview,
        releaseYear: movie.releaseYear,
        runtime: movie.runtime,
        genres: movie.genres,
        createdBy: creatorId,
      });
    });
  }

  await prisma.movie.createMany({
    data: moviesToInsert,
    skipDuplicates: true,
  });

  console.log("100 real movies seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });