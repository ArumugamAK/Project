const express =require("express");
const userController = require("../controllers/users");
const router=express.Router();
router.get(["/","/login"], (req,res) => {
    //res.send("<h1>Hello AK </h2>");
    res.render("login");
});
router.get("/register", (req,res) => {
    //res.send("<h1>Hello AK </h2>");
    res.render("register");
});
router.get("/profile",userController.isLoggedIn,(req,res) => {
   //res.render("profile");
   if(res.user){
    console.log("2");
    res.render("profile",{user:res.user});
   }
    else{
        console.log("3");
        res.redirect("/login");
    }
    // if(req.user){
    //     res.render("profile",{user:req.user})
    //  }
    //  else{
    //      res.redirect("/login");
    //   }
     //res.render("home");
    //res.send("<h1>Hello AK </h2>");
});
router.get("/home",userController.isLoggedIn, (req,res) => {
    console.log(res.user);
    //res.render("home");
    if(res.user){
        console.log("2");
        res.render("home",{user:res.user});
    }
    else{
        console.log("3");
        res.redirect("/login");
    }
    //if(req.user){
    //     res.render("home",{user:req.user})
    // }
    // else{
    //     res.redirect("/login");
    // }
    //res.send("<h1>Hello AK </h2>");
   
});
module.exports = router;