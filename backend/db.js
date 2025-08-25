const mongoose = require('mongoose');
require('dotenv').config();
const mongourl = 'mongodb://127.0.0.1:27017/Book_recommend'

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