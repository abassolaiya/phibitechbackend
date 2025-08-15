const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");

const app = express();
// require('dotenv').config();
require("dotenv").config({ path: "./dev.env" });

// Load Models
require("./src/models/users/Author");
require("./src/models/blog/BlogPost");
require("./src/models/blog/Comments");
require("./src/models/blog/Reply");
require("./src/models/Courses/Course");
require("./src/models/Courses/StudentRegistration");

// Passport Config
require("./src/config/passport");

mongoose
  .connect(
    "mongodb+srv://ayotundeolaiya:James4vs17@cluster0.pxvfa5n.mongodb.net/phibitech?retryWrites=true&w=majority",
    {
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
    }
  )
  .catch((error) => {
    console.log("mongodb connection error: ", error);
  });

// Connect to MongoDB
// mongoose.connect("mongodb://localhost:27017/blogDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useFindAndModify: false,
// });

// Middleware
app.use(bodyParser.json());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

const cors = require("cors");
app.use(
  cors({
    origin: "https://www.phibitech.com", // frontend URL
    credentials: true, // allow credentials (cookies, sessions)
  })
);

// Routes
app.use("/api/blogposts", require("./src/routes/Blog/BlogPostRoutes"));
app.use("/api/authors", require("./src/routes/users/userRoutes"));
app.use("/api/jobs", require("./src/routes/jobs/jobRoutes"));
app.use("/api/courses", require("./src/routes/Courses/courseRoutes"));
app.use("/api/register", require("./src/routes/Courses/registrations"));
app.use("/api/consultations", require("./src/routes/consultationRoutes"));

// Auth Routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/");
  }
);

// Start Server
const PORT = process.env.PORT || 3800;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
