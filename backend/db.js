const mongoose = require('mongoose');
require('dotenv').config();
const mongourl = process.env.MONGODB_URL

// const mongourl = process.env.DB_URL;
mongoose.connect(mongourl)

const db = mongoose.connection;

db.on('connected' , () => {
    console.log('connected to Mongodb server');
})

db.on('error' , (err) => {
    console.error('Error occured:',err);
})

db.on('disconnected' , () => {
    console.log('Mongodb server disconnected');
})

module.exports = db;