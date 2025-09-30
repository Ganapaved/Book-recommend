const mongoose = require('mongoose');

const bookschema = new mongoose.Schema({
    title :{
        type: String,
        required: true,
        index :true
    },
    author : {
        type: String,
        required: true,
        index: true
    },
    genres : [{
        type:String,
        index : true
    }],
    description :{
        type:String,
        default : " "
    },
    addedBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref :'User'
    },
    likedBy : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        default : []
    }],
    photo :{
        type : String
    }
},
{timestamps : true}
);

bookschema.index({
    title : 'text',
    author : 'text',
    description  : 'text'
});

const Books = mongoose.model('Books', bookschema);
module.exports = Books;