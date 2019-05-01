const express             = require("express"),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    bodyParser            = require("body-parser"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    User                  = require("./models/user");

mongoose.connect("mongodb://localhost/auth_demo_app", { useNewUrlParser: true });

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));

app.use(require("express-session")({
    secret: "Meaty is the best dog in the world",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//====================================
//              ROUTES
//====================================


app.get("/", (req, res) => {
    res.render("home");
});

app.get("/secret", isLoggedIn, (req, res) => {
    res.render("secret");
});

//Auth Routes

//show sign up form 
app.get("/register", (req, res) => {
    res.render("register");
});

//handling user sign up
app.post("/register", (req, res) => {
    User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, () => {
            res.redirect("/secret");
        });
    });
});

//LOGIN ROUTES

//render login form
app.get("/login", (req, res) => {
    res.render("login");
});

//login logic
//middleware
app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
}), (req, res) => {
});

app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

app.listen(3000, () => {
    console.log("SERVER HAS STARTED!")
});
