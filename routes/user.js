const express = require("express");
const router = express.Router();
const User = require('../models/user.js');
const passport = require("passport");
const { saveUrl, loggedin } = require("../expressMiddleware.js");
const userController = require("../controllers/user.js")

//signup ka leya form open krna get sa && user signup krna db mai

router.route("/signup")
        .get(userController.signupFormRender)
        .post(userController.signup);


//login ka liya form open by get && login kai liya authantegate krna by passport
router.route("/login")
        .get(userController.renderLoginForm)
        .post(
        saveUrl,  //  ye alag middleware hai
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true
        }),
        (req, res) => {
            req.flash("success", "WELCOME BACK TO WONDERLUST :)");

            const redirectUrl = res.locals.redirectUrl || "/listings";

            delete req.session.redirectUrl;

            res.redirect(redirectUrl);
}
        );

//user logout ka liya
router.get("/logout",userController.logout)


module.exports = router;
