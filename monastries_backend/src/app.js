const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
require('dotenv').config();

// CORS configuration for frontend
const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',
]);

const corsOptions = {
  origin(origin, cb) {
    // Allow same-origin / curl / mobile apps (no Origin header)
    if (!origin) return cb(null, true);
    if (allowedOrigins.has(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
// Explicitly respond to preflight requests for all routes
app.options(/.*/, cors(corsOptions));

// Increase payload limits for base64 image uploads from frontend forms
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const monasteryRouter = require("./routes/monastery");
const travelGuideRouter = require("./routes/travelGuide");
const contributionRouter = require("./routes/contribution");
const locationRouter = require("./routes/location");
const guideRouter = require("./routes/guide");
const reviewRouter = require("./routes/review");

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);
app.use("/",userRouter);
app.use("/",monasteryRouter);
app.use("/",travelGuideRouter);
app.use("/",contributionRouter);
app.use("/",locationRouter);
app.use("/",guideRouter);
app.use("/",reviewRouter);

connectDB()
    .then(()=>{
        console.log("Database connection established ...");
    app.listen(process.env.PORT,()=>{
    console.log(`Server is successfully running on port ${process.env.PORT} .....`);
    });
    })
    .catch((err) =>{
        console.error("Database cannot connected!!!!");
    })