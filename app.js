
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
app.set("trust proxy", 1);

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const usersRouter = require("./routes/user.js");

const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

// -------------------- BASIC CONFIGURATION --------------------

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// -------------------- DATABASE CONFIGURATION --------------------

const atlasUrl = process.env.ATLAS_DB_URL;

if (!atlasUrl) {
    console.error("ATLAS_DB_URL is missing in environment variables.");
    process.exit(1);
}

// -------------------- SESSION CONFIGURATION --------------------

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
    console.error("SESSION_SECRET is missing in environment variables.");
    process.exit(1);
}

const store = MongoStore.create({
    mongoUrl: atlasUrl,
    crypto: {
        secret: process.env.SESSION_SECRET
    },
    touchAfter: 24 * 3600
});

store.on("error", (err) => {
    console.error("Session store error:", err.message);
});

const sessionOption = {
    store: store,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }
};

app.use(session(sessionOption));
app.use(flash());

// -------------------- PASSPORT CONFIGURATION --------------------

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// -------------------- LOCALS FOR EJS --------------------

app.use((req, res, next) => {
    res.locals.succ = req.flash("succes");
    res.locals.er = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// -------------------- ROUTES --------------------

app.get("/", (req, res) => {
    res.send("this is my home");
});

app.get(
    "/testListing",
    wrapAsync(async (req, res) => {
        const sampleListing = new Listing({
            title: "my new villa",
            discription: "i am selling my villa",
            location: "delhi road, mukharji nagar",
            country: "india",
            price: 5000
        });

        await sampleListing.save();
        res.send("successfully saved");
    })
);

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", usersRouter);

// -------------------- 404 ERROR HANDLER --------------------

app.use((req, res, next) => {
    next(new ExpressError(404, "This is not a correct path"));
});

// -------------------- GENERAL ERROR HANDLER --------------------

app.use((err, req, res, next) => {
    const status = err.status || 500;

    if (res.headersSent) {
        return next(err);
    }

    res.status(status).render("error.ejs", { err });
});

// -------------------- START SERVER AFTER DB CONNECTS --------------------

const PORT = process.env.PORT || 8080;

async function startServer() {
    try {
        await mongoose.connect(atlasUrl);
        console.log("MongoDB connected successfully");

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server is listening on port ${PORT}`);
        });
    } catch (err) {
        console.error("MongoDB connection failed:", err.message);
        process.exit(1);
    }
}

startServer();
