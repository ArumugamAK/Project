const mysql2 = require("mysql2");
const jwt =require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");
const db=mysql2.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE,
});
exports.login=(req,res)=>{
    try{
        const { email, Password} = req.body;
        if(!email || !Password){
            return res.status(400).render("login",{msg: "Please Enter Email and Password ",msg_type:"error" });
        }
        else{
            
            db.query('select * from users where email=?',[email],async(error,results)=>{
                
                console.log(results+"form submited");
                if(results.length<=0){
                return res.status(401).render("login",{msg: "Email or Password Incorrect....",msg_type:"error" });
            }  
            else{
                if(!(await bcrypt.compare(Password,results[0].PASS))){
                    return res.status(401).render("login",{msg: "Email or Password Incorrect....",msg_type:"error" });}
                    else { 
                     const id=results[0].ID;
                     const token=jwt.sign({ id: id},process.env.JWT_SECRET,{
                        expiresIn: process.env.JWT_EXPIRES_IN,
                     });
                     console.log("The Token is " + token);
                     const cookieOption={
                        expires : new Date( Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 10000),
                           httpOnly: true,
                     };
                     res.cookie("joes",token,cookieOption);
                     res.status(200).redirect("/home");
                   }
                }
                
                
                
            });
        }
    }
    catch(error){
        console.log(error);
    }
};
exports.register=(req,res)=>{
   // console.log(req.body);
    const { name, email, Password, confirm_Password } = req.body;
    db.query('select email from users where email=?',[email],async(error,results)=>{
       if(error){
        console.log(error);
        return;
       }
       if(results.length > 0){
        return res.render("register",{msg: "Email id already taken",msg_type:"error" });
       }
       else if(Password !== confirm_Password){
        return res.render("register",{msg: "Password do not match",msg_type:"error" });
       }
       let hashedPassword = await bcrypt.hash(Password,8);
      // console.log(hashedPassword );
      db.query('insert into users set ?',{ NAME: name, EMAIL: email, PASS: hashedPassword },(error,results)=>{
          if(error){
            console.log(error);
          }
          else{
            //console.log(results);
            return res.render("register",{msg: "Registration Successfully",msg_type:"good" });
          }
      });

      
    });
};
exports.isLoggedIn = async (req,res,next)=>{
    console.log(req.cookies);
    //next();
    if(req.cookies.joes){
     try{
      const decode=await promisify(jwt.verify)(
      req.cookies.joes,process.env.JWT_SECRET
      );
     // console.log(decode);
      db.query("select * from users where id=?",[decode.id],(err,results)=>{
        console.log(results);
        if(!results){
            return next();
        }
        else{
        res.user=results[0];
       // console.log("use1")
        return next();
        }
       });
     }
      catch(error){
        console.log(error);
        return next();
     }
    }
    else{
        next();
    }   
};


