import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const URI = process.env.MONGOODB_URL;

mongoose.connect(
  `${URI}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) throw err;
    console.log("Mongodb connection");
  }
);
