const {Router} =require('express');

const Books =require( "../models/Book");
const multer = require('multer');

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

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

router.get('/:id',async (req,res)=>{
  try{
    const book_id = req.params.id;
    const book_present = await Books.findById(book_id);
    // console.log('Book',book_present);
    
    res.status(200).json({book_present});
  }
  catch(err){
    console.log(err);
    res.status(500).json(err);
  }
})

router.post('/add',upload.single('photo'),async (req,res)=>{
    try{
        const {title,author,genres =[],description='',userId} = req.body;
        if(!title || !author)
            res.status(400).json({error  : "title and author are required"});
        const photobase64 = req.file ? req.file.buffer.toString('base64') : null;
    
        const newbook = await Books({title,author,genres,description,addedBy: userId , photo:photobase64});
        const book = await newbook.save();
        res.status(201).json({message : "Book added successfully", book});
    }
    catch(err){
        console.error('Error adding book:', err);
        res.status(500).json({error: 'Internal server error'});
    }
});

module.exports= router;