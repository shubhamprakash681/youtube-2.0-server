import mongoose from "mongoose";
import { DB_NAME, DB_QUERY } from "../constants";

const connectToDatabase = async () => {
  const dbURL = `${process.env.MONGODB_URI}/${DB_NAME}${DB_QUERY}` || "";

  try {
    const connectionInstance = await mongoose.connect(dbURL);

    console.log(
      `\nMongoDb connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (err) {
    console.error("MongoDb connection FAILED: ", err);
    process.exit(1);
  }
};

export default connectToDatabase;
