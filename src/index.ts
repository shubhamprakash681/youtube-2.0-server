import dotenv from "dotenv";
import app from "./app";
import connectToDatabase from "./config/db.config";

dotenv.config({
  path: "./.env",
});

// handling Uncaught Exceptions
process.on("uncaughtException", (errr: Error) => {
  console.log(`Error: ${errr.message}`);
  console.log(`Shutting down the server due to Uncaught Exceptions`);

  process.exit(1);
});

const port = process.env.PORT || 3000;

// db connection
connectToDatabase();

// creating server
const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// handling unhandled promise rejection
// example:- try giving wrong DB_URI
process.on("unhandledRejection", (err: Error) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Unhandled Promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});
