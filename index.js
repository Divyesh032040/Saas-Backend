
// Import necessary modules
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require("./src/database/database");
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const winston = require('./src/logger')
const logger = require("./src/logger")
const passport = require("passport");
const { rateLimit } = require('express-rate-limit');
require('./src/middleware/passport')(passport)

dotenv.config();


// Create an Express app
const app = express();
const PORT = process.env.PORT || 3001;



//morgan formate
const morganFormat = ":method :url :status :response-time ms";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
            method: message.split(" ")[0],
            url: message.split(" ")[1],
            status: message.split(" ")[2],
            responseTime: message.split(" ")[3],
        };

        logger.info(JSON.stringify(logObject));
      },
    },
  })
);


// Middleware Configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200
}));

const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Redis, Memcached, etc. See below.
})

// Apply the rate limiting middleware to all requests.
app.use(limiter)

// Parsing middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.use(passport.initialize());


// Serve static files
app.use(express.static('public'));

// Import and mount routes
// const userRoute = require("./src/routes/userRoutes");
// const subscriptionMaster = require("./src/routes/subscriptionMasterRoutes");
// const subscriptionRouter = require("./src/routes/SubscriptionRoutes");
const clientRoute = require("./src/routes/ClientRoute");
const adminRoute = require("./src/routes/adminRoute");
const productRouter = require("./src/routes/product.route");
const productCategoryRouter = require("./src/routes/productCategory.route")
const priceListRouter = require("./src/routes/priceList.route");

// app.use('/api/v1', userRoute);
// app.use('/api/v1', subscriptionMaster);
// app.use('/api/v1' , subscriptionRouter);
app.use('/api/v1' , clientRoute);
app.use("/api/v1" , adminRoute);
app.use("/api/v1" , productRouter);
app.use("/api/v1" , productCategoryRouter);
app.use("/api/v1" , priceListRouter);


// Root route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});


// Database connection and server start
const startServer = async () => {
  try {
    await connectDB();
    console.log("Database connected successfully");
    
    app.listen(PORT , () => {
      console.log(`Server is running on port :${PORT}`);
    });

  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1); 
  }
};

startServer();




// logger.info("This is an info message");
// logger.error("This is an error message");
// logger.warn("This is a warning message");
// logger.debug("This is a debug message");

