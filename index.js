const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const userRoute = require('./routes/users.js')
const authRoute = require('./routes/auth.js')
const postRoute = require("./routes/posts.js")

dotenv.config();

const connectToMongo = async () => {
    try {
        mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB")
    } catch (error) {
        console.log(error)
    }
}

connectToMongo();

//middleware
app.use(express.json());
app.use('/uploads', express.static('uploads'))
app.use(cors());
app.use(helmet());
app.use(morgan("common"));

app.use("/api/users", userRoute)
app.use("/api/auth", authRoute)
app.use("/api/posts", postRoute)

app.listen(8800, () => {
    console.log("Backend server is running");
});