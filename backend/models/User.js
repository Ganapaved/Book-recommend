const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const userschema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique : true
    },
    email : {
        type : String,
        required   : true,
        unique : true
    },
    passwordHash : {
        type :String,
        required : true
    },
    likedBooks : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Books',
        default : []
    }],
    following : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User',
            default : []
        }
    ],
    addedBooks : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Books',
            default : []
        }
    ]
},
{timestamps : true}
);

userschema.pre('save',async function(next){
    const person = this;

    if(!person.isModified('passwordHash')) return next();
    try{
        const salt = await bcrypt.genSalt(10);

        const hashPassword = await bcrypt.hash(person.passwordHash , salt);
        person.passwordHash = hashPassword;
        next();
    }catch(err){
        return next(err);
    }
})
    
userschema.methods.comparePassword = async function(candidatepassword){
    try {
        const isMatch = await bcrypt.compare(candidatepassword , this.passwordHash);
        return isMatch;
    }catch(err){
        throw err;
    }
}


const User = mongoose.model('User', userschema);
module.exports = User;