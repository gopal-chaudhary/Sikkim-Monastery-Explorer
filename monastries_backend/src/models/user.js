const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/env");

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        reuired:true,
        minLength: 3,
        index:true //This means this is index 
    },
    lastName:{
        type:String,
        required:true
    },
    emailId:{
        type:String,
        required:true,
        //mongodb automatically creates index for unique:true
        //unique index is much faster
        unique:true,
        lowercase:true,
        trim:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid email address : "+ value);
            }
        }
    },
    password:{
        type:String,
        required:true,
        // minLength: 8,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Correct your Password" + value);
            }
        }
    },
    age:{
        type:Number,
        min: 0
    },
    about:{
        type:String,
        default:"This is default for user"
    },
    gender:{
        type: String,
        enum:{
            values : ['Male','female','other'],
            message : `{VALUE} is not a valid gender type.`
        }
        //Still this function does not work still we not update the patch api to runvalidators :true
        // validate(value){
        //     if(!["male","Male","Female","female","Others","others"].includes(value)){
        //         throw new Error ("Not a valid gender (male, female and others)")
        //     }
        // },
        // required:true
    },
    photoUrl:{
        type: String,
    },
    skills:{
        type: [String],
    },
    // Role for admin access and guide
    role: {
        type: String,
        enum: ['user', 'admin', 'guide'],
        default: 'user'
    },
    // Contribution points system
    contributionPoints: {
        type: Number,
        default: 0
    },
    contributionsCount: {
        type: Number,
        default: 0
    },
    // Badges earned
    badges: {
        type: [String],
        default: []
    }
},{
    timestamps:true
});

//but also don't good to create unnecessary index as this is very costly
//when u create a lot of index this is also very difficult to db 
//so please create and aware of all the index you made off.
//why do we need indexing in DB?
//what is advantages and disadvanatages of creating indexes in DB?
// const user = mongoose.model("user",userSchema);

// user.find({firstName: "Tanush", lastName : "Arora"});
// userSchema.index({firstName:1,lastName:1}); //this is known as the compound index

//cannot use arrow function in that as they break logic
//cannot use arrow function as this function is a very different implementation 
// so inside arrow function this function will cannot work
userSchema.methods.getJWT = async function (){

    //This function will have a very closely related to user schema as every user has their own
    //different json web token 
    const user = this;
    const token = await jwt.sign({_id:user._id}, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn,
    });
    return token;
};
userSchema.methods.validatePassword = async function(passwordInputByUser){
    const user = this;
    const passwordHash = user.password;
    const isPasswordValid = await bcrypt.compare(passwordInputByUser,passwordHash);
    return isPasswordValid;
}

module.exports = mongoose.model('user',userSchema);