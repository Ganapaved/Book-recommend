const express =require('express');
const cors =require('cors');
const bookRouter =require('./routes/book');
const usersRouter =require('./routes/users');
const recommendRouter =require('./routes/recommend');
const db =require('./db');
const bodyParser = require('body-parser');
const passport = require('./auth')
const bookchatbot = require('./routes/bookchatbot');


require('dotenv').config();


const app = express();
app.use(bodyParser.json({limit:'10mb'}));
app.use(bodyParser.urlencoded({limit:'10mb',extended:true}));
app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({limit:'10mb',extended:true}));

app.use(cors());


const logrequest = (req , res , next)=>{
    console.log(`${Date().toLocaleString()} Request made to ${req.originalUrl}`);
    next();
}
app.use(logrequest);
const localAuth = passport.authenticate('local' , {session : false});
app.use(passport.initialize())

app.use('/book', bookRouter);
app.use('/users', usersRouter);
app.use('/recommend', recommendRouter);
app.use('/bookai',bookchatbot);

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log('Server is listening in PORT',PORT);
})