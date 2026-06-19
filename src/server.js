import 'dotenv/config';
import express from 'express';
import { connectDB, disconnectDb } from './config/db.js';
// imported Routes
import moviesRoutes from './routes/movieRoutes.js';
import authRoutes from './routes/authRoutes.js';
import watchlistRoutes from './routes/watchlistRoutes.js';


const app = express();

//for parsing application/json
app.use(express.json());
// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));


app.use('/movies', moviesRoutes);
app.use('/auth', authRoutes); 
app.use('/watchlist', watchlistRoutes); 

const PORT = process.env.PORT || 3000;

let server;

const start = async () => {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
};

start();

process.on('unhandledRejection', (err ) => {
  console.error('Unhandled Rejection:', err);
  server.close(async () => {
    await disconnectDb();
    process.exit(1);
  });
});

process.on('uncaughtException', async (err) => {
  console.error('Uncaught Exception:', err);
  await disconnectDb();
  process.exit(1);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(async () => {  
  await disconnectDb();
  process.exit(0);
  });
});