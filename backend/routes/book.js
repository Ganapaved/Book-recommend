const {Router} =require('express');

const Books =require( "../models/Book");

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { search, author, limit = 20 } = req.query;
    console.log('query', req.query);

    const q = {};
    if (author) q.author = new RegExp(author, 'i');
    if (search) {
      q.$or = [ // ✅ should be $or, not $for
        { title: new RegExp(search, 'i') },
        { author: new RegExp(search, 'i') },
      ];
    }

    const books = await Books.find(q).limit(Number(limit));
    res.status(200).json({ books }); // ✅ return as { books }
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/add',async (req,res)=>{
    try{
        const {title,author,genres =[],description='',userId} = req.body;
        if(!title || !author)
            res.status(400).json({error  : "title and author are required"});
    
        const book = await Books.create({title,author,genres,description,addedBy: userId});
        res.status(201).json({message : "Book added successfully", book});
    }
    catch(err){
        console.error('Error adding book:', err);
        res.status(500).json({error: 'Internal server error'});
    }
});

module.exports= router;