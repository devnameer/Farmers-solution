const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");

const MONGO_URL = "mongodb://127.0.0.1:27017/farmers";

// Database connection
async function main() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to the Database");
    } catch (err) {
        console.error("Database connection error:", err);
    }
}
main();

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Session configuration
const sessionOptions = {
    secret: "myrandomsecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};
app.use(session(sessionOptions));
app.use(flash());

// Middleware to pass flash messages to all views
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// Routes
app.get("/", (req, res) => {
    res.render("home.ejs");
});

// Catch-all route for undefined paths
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Error handling middleware
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something Went Wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

// Start server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
