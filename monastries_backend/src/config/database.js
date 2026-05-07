const mongoose = require("mongoose");
const config = require("./env");

const connectDB = async () => {
    await mongoose.connect(config.databaseUri);
};

module.exports = connectDB;

