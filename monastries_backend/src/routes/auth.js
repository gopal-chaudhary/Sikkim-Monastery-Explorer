const express = require('express');
const authRouter = express.Router();
const {validateSignUpData} = require("../utils/validation"); 
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const user = require("../models/user");
// authRouter.get('/')

// app.use() is same as router.use() there is almost no difference 
//Signup API
authRouter.post("/signup",async (req,res) =>{
    
    // console.log(req.body);
    //Creating a new user instance of the user model
    // const user = new User({
    //     firstName:"Tanush",
    //     lastName:"Arora",
    //     emailId:"tanush935@gmail.com",
    //     password:"tanush@123",
    // });
    // const user = new User(req.body);

    try{
        //Validation of data
        validateSignUpData(req);

        const {firstName, lastName , emailId } = req.body;
        //Encrypt the password
        const { password } = req.body;
        // bcryptjs: pure JS, no native build; same API as bcrypt
        const passwordHash = await bcrypt.hash(password, 10);
        console.log(passwordHash);

        //Creating a new user instance of the user model
        // const user = new User(req.body);
        const user = new User({
            firstName,
            lastName,
            emailId,
            password:passwordHash
        });

        const savedUser = await user.save();
        
        // Create JWT token and send user data
        const token = await savedUser.getJWT();
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "Lax",
            expires: new Date(Date.now() + 8 * 360000),
        });
        
        res.json({
            message: "User created successfully",
            user: {
                _id: savedUser._id,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                emailId: savedUser.emailId,
                age: savedUser.age,
                gender: savedUser.gender,
                photoUrl: savedUser.photoUrl,
                about: savedUser.about,
                skills: savedUser.skills
            }
        });
    }catch(err){
        // Handle duplicate key error for unique email (E11000)
        let message = err.message;
        if (err.code === 11000 || (err.message && err.message.includes('E11000'))) {
            // Prefer a clear, client-friendly message
            if (err.keyValue && err.keyValue.emailId) {
                message = 'User with this email already exists';
            } else {
                message = 'User already exists';
            }
        }
        res.status(400).json({ success: false, message });
    }
});

//Login API
authRouter.post("/login" ,async (req,res) =>{
    try{
        const {emailId ,password} = req.body;
        const users = await User.findOne({emailId:emailId});
        if(!users) throw new Error("Invalid Credentials!!");
        //bcrypt.compare(plainpassword,passwordhash)
        // const isPasswordValid = bcrypt.compare("Joker$123","$2b$10$Ltc/7LwMhxSHsShPS4Jh9OmNfLdPLgEorB5yqrKhO.FLi2.TM5sD.")
        // const isPasswordValid = await bcrypt.compare(password,users.password);
        const isPasswordValid = await users.validatePassword(password);
        if(isPasswordValid){
            // //JWT token
            //No problem with this code but create this method near to userschema 
            //to attached it with userschema 
            // const token = await jwt.sign({_id: users._id},"Tanush@123",{
            //     expiresIn : "1h",
            // });
            // console.log(token);

            //Add the token to cookie and send the response back to the user
            // res.cookie("token","82349824284294jdhfsjhffsifjs");
            // res.cookie(token);
            const token = await users.getJWT();
            res.cookie("token", token, {
            httpOnly: true,
            sameSite: "Lax",
            expires: new Date(Date.now() + 8 * 360000),
            });
            res.json({
                _id: users._id,
                firstName: users.firstName,
                lastName: users.lastName,
                emailId: users.emailId,
                age: users.age,
                gender: users.gender,
                photoUrl: users.photoUrl,
                about: users.about,
                skills: users.skills
            });
        }
        else throw new Error("Invalid Credentials!!");

    }catch(err){
        res.status(400).json({ success: false, message: err.message });
    }
})

authRouter.post("/logout",async (req,res) =>{
    try{
        res.cookie("token",null,{
            expires: new Date(Date.now())
        });
        res.json({ success: true, message: "User logged out successfully" });
    }catch(err){
        res.status(400).json({ success: false, message: err.message });
    }
})
//order of the route matters a lot

module.exports = authRouter;