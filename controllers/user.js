const User = require("../models/user.js");

module.exports.signupFormRender = (req,res)=>
{
    res.render("users/signup.ejs");
}

module.exports.signup = async(req,res,next)=>
{
    try{
        let {username ,email , password} = req.body;
        let newuser = new User({username , email});
        let ru =  await User.register(newuser , password);
        console.log(ru);
        req.login(ru,(err)=>
        {
            if(err)
            {
                next(err);
            }
              req.flash("succes" , "WELLCOME TO WONDERLUST");
             res.redirect("/listings");
        })
      
    }catch(e)
    {
        req.flash("error",e.message);
        res.redirect("/signup");
    }
}

module.exports.renderLoginForm = (req,res)=>
{
    res.render("users/login.ejs")
}

module.exports.logout = (req,res)=>
{
    req.logOut((err)=>
    {
       if(err)
       {
         next(err);
       }
       req.flash("succes" ,"user logout successfullly :)");
       res.redirect("/listings");
    })
}