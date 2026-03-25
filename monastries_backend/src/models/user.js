const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
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
    location:{
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

// Compound indexes for common queries
userSchema.index({ role: 1, contributionPoints: -1 }); // Leaderboard queries
userSchema.index({ contributionsCount: -1 }); // Top contributors
userSchema.index({ role: 1, isActive: 1 }); // Active users by role
userSchema.index({ "skills": 1 }); // Skill-based searches
userSchema.index({ createdAt: -1 }); // Recent users

// Text index for user search
userSchema.index({ 
    firstName: 'text', 
    lastName: 'text', 
    about: 'text',
    skills: 'text'
});

// User methods for authentication
userSchema.methods.getJWT = async function (){
    const user = this;
    const token = await jwt.sign({_id:user._id},process.env.JWT_SECRET,{
        expiresIn:"7d",
    });
    return token;
};

userSchema.methods.validatePassword = async function(passwordInputByUser){
    const user = this;
    const passwordHash = user.password;
    const isPasswordValid = await bcrypt.compare(passwordInputByUser,passwordHash);
    return isPasswordValid;
};

module.exports = mongoose.model('user',userSchema);