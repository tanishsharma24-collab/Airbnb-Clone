if(process.env.NODE_ENV != "production")
{
    require('dotenv').config()
}
// console.log(process.env.cloud_name) ;

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError");

const Review = require("./models/review.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const usersRouter = require("./routes/user.js");

//sesssion kki information mongostor mai save hote hai taki info lost nhi hoo refresh hona par
const session = require("express-session");
const MongoStore = require("connect-mongo").default;


const flash = require("connect-flash");

const passport =  require("passport");
const LocalStrategy = require("passport-local");
const User = require('./models/user.js');

app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname,"public")));

app.engine("ejs", ejsMate);

app.set("view engine" , "ejs");
app.set("views", path.join(__dirname, "views"));

let atlasUrl = process.env.ATLAS_DB_URL;
main()
.then(()=>{
    console.log("connection succesfully");
})

.catch(err => console.log(err));
async function main() {
  await mongoose.connect(atlasUrl);
}


//connect-mongoose(session stor)
const store = MongoStore.create({
    mongoUrl: atlasUrl,
    crypto: {
        secret: "thisismysecretcode"
    },
    touchAfter: 24 * 3600
});
const sessionOption = {
    store,
    secret: "thisismysecretcode",
    resave: false,
    saveUninitialized: true, // fixed
    cookie: {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};




app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>
{
    res.locals.succ = req.flash("succes");
    res.locals.er = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

// app.get("/demouser",async (req,res)=>
// {
//     let fakeuser = new User({
//         email : "tanissh@22012",
//         username : "tanish sharma"
//     });
//     let ru =   await  User.register(fakeuser , "mypassword");
//     res.send(ru);
// })


app.listen(8080 , ()=>{
    console.log("server is listining to the port");
});

app.get("/",(req,res)=>{
    res.send("this is my home");
});

app.get("/testListing",wrapAsync( async (req,res)=>{
    let sampleListing = new Listing({
        title : "my new villa",
        discription : "i am selling my villa",
        location : "delhi road , mukharji nagar",
        country :"india",
        price : 5000
    });



    await sampleListing.save();
    res.send("successfully saved");
}));

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",usersRouter);



app.use((req, res, next) => {
   throw new ExpressError(404, "This is not a correct path");
   next();
});

// app.all("*",(req,res,next)=>
// {
//      throw new ExpressError(404, "This is not a correct path");
//      next(err);
// })

app.use((err,req,res,next)=>
{
   let {status = 500 , message="somthing went wrong"} = err;
  res.render("error.ejs",{err});
})

