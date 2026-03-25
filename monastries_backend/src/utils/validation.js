const validator = require("validator");
const validateSignUpData = (req) => {
    const {firstName,lastName,emailId,password}  = req.body;
    if(!firstName || !lastName){
        throw new Error("Name is not valid ");
    } else if(firstName.length < 3 || firstName.length > 50){
        throw new Error("FirstName should be 3 to 50 characters");
    }else if(!validator.isEmail(emailId)){
        throw new Error("Email id is not valid");
    }else if(!validator.isStrongPassword(password)){
        throw new Error("This password is not valid");
    }
}

const validateEditProfileData = (req) =>{
    const allowedEditFields = 
    [
        "firstName",
        "lastName",
        "emailId",
        "photoUrl",
        "gender",
        "age",
        "about",
        "skills"
    ]

    const isEditAllowed = Object.keys(req.body).every(field => allowedEditFields.includes(field));
    return isEditAllowed; 
}

const validateEditProfile = (data) => {
    const {firstName, lastName, emailId, age, photoUrl} = data;
    
    if (!firstName || firstName.length < 3 || firstName.length > 50) {
        const error = new Error("First name should be 3 to 50 characters");
        error.status = 400;
        throw error;
    }
    
    if (!lastName || lastName.length < 3 || lastName.length > 50) {
        const error = new Error("Last name should be 3 to 50 characters");
        error.status = 400;
        throw error;
    }
    
    if (emailId && !validator.isEmail(emailId)) {
        const error = new Error("Email id is not valid");
        error.status = 400;
        throw error;
    }
    
    if (age && (age < 1 || age > 120)) {
        const error = new Error("Age should be between 1 and 120");
        error.status = 400;
        throw error;
    }
    
    if (photoUrl && !validator.isURL(photoUrl)) {
        const error = new Error("Photo URL is not valid");
        error.status = 400;
        throw error;
    }
}

module.exports = {
    validateSignUpData,
    validateEditProfileData,
    validateEditProfile
};