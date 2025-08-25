const {Router} =require('express');
const User =require("../models/User");
const Books =require( "../models/Book");
const { jwtAuthmiddleware ,generateToken} = require('../jwt');

const router = Router();

router.post('/signup',async (req,res) =>{
    try{
        const data = req.body;
        const newPerson = new User(data);
        const savedPerson = await newPerson.save();
        console.log('Data saved');
        const payload = {
            id  : savedPerson.id,
            username : savedPerson.username
        }
        const token = generateToken(payload);
        console.log('Token is generated :',token);
         res.status(200).json({response : savedPerson , token : token});
    }catch(err){
        console.log(err);
    }
})

router.get('/profile', jwtAuthmiddleware, async (req, res) => {
    try{
        const userid = req.userPayload.id;
        const userdata = await User.findById(userid);
        res.status(200).json({user:userdata});
    }
    catch(err){
        res.json(err);
    }
})

router.get('/all' , jwtAuthmiddleware ,async (req,res)=>{
    try{
        const userId = req.userPayload.id;
        const users = await User.find({_id : {$ne : userId}}).select("username");
        res.json({users});
    }catch(err){
        console.log(err);
        res.status(500).json(err);
    }
})

router.post('/:userId/follow' , jwtAuthmiddleware,async (req,res) =>{
    try{
        const me = req.userPayload.id;
        const other = req.params.userId;

        await User.findByIdAndUpdate(me , {$addToSet : {following : other}});
        res.json({ok : true , following : other});
    }catch(err){
        console.log(err);
        res.status(500).json(err);
    }
})

router.post('/:userId/unfollow', jwtAuthmiddleware , async (req,res) =>{
    try{
        const me = req.userPayload.id;
        const other = req.params.userId;

        await User.findByIdAndUpdate(me,{$pull : {following : other}});
        res.json({ok : true , unfollowed : other});
    }catch(err){
        console.log(err);
        res.status(500).json(err);
    }
})

router.get('/', jwtAuthmiddleware, async (req, res) => {
   try {
    if (!req.userPayload || !req.userPayload.id) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    const user = await User.findById(req.userPayload.id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    console.log('user fetched successfully:', user);
    
    res.json({ user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/login',async (req,res) =>{
    try{
        const {username,password} = req.body;
        const user = await User.findOne({username : username});

        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({error : 'Invalid username or password'});
        }

        const payload = {
            id : user.id,
            username : user.username
        }

        const token = generateToken(payload);
        console.log('Token generated successfully');
        res.json({token : token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error : 'Internal server error'});
    }
})

router.post('/like/:bookId',jwtAuthmiddleware, async (req, res) =>{
    try {
        const { bookId} = req.params;
        const userId = req.userPayload.id;
        // console.log(userId,bookId);
        
        const user = await User.findById(userId);

        const alreadyliked = user.likedBooks.includes(bookId);
        if(alreadyliked){
            await User.findByIdAndUpdate(userId,{$pull:{likedBooks:bookId}});
            await Books.findByIdAndUpdate(bookId,{$pull :{likedBy:userId}});
            return res.status(200).json({ message: "Unliked successfully", liked: false });
        }
        else{
            await User.findByIdAndUpdate(userId , {$addToSet  :{likedBooks : bookId}});
            await Books.findByIdAndUpdate(bookId, {$addToSet: {likedBy: userId}});
            res.status(200).json({message: "Book liked successfully",liked: true});
        }
    }
    catch(err) {
        console.error('Error liking book:', err);
        res.status(500).json({error: 'Internal server error'});
    }
});

router.get('/like',jwtAuthmiddleware, async (req,res)=>{
    try{
        const userId = req.userPayload.id;
        const user = await User.findById(userId).populate('likedBooks');
        
        
        res.json({ like: Array.isArray(user.likedBooks) ? user.likedBooks : [user.likedBooks] });
    }
    catch(err){
        console.log(err);
        res.status(500).json({error : 'Internal server error'});
    }
})

router.post('/follow/:targetId',jwtAuthmiddleware, async (req, res) => {
    try{
        const userData = req.userPayload;
        const userId = userData.id;
        const {targetId} = req.params;
        const user = await User.findById(userId);
        if(userId === targetId) {
            return res.status(400).json({error: "You cannot follow yourself"});
        }
        await User.findByIdAndUpdate(userId, {$addToSet :{following: targetId}});
        res.status(200).json({message: "Followed successfully", ok: true});
    }
    catch(err) {
        console.error('Error following user:', err);
        res.status(500).json({error: 'Internal server error'});
    }
});

router.get('/likes',jwtAuthmiddleware,async(req,res)=>{
    try{
        const userData = req.userPayload;
        const userId = userData.id;
        const user = await User.findById(userId)
        if(!user) {
            return res.status(404).json({error: "User not found"});
        }
        const books = await Books.find({_id: {$in: user.likedBooks || []}});
        res.status(200).json(books);
    }
    catch(err) {
        console.error('Error fetching liked books:', err);
        res.status(500).json({error: 'Internal server error'});
    }   
});

router.post

module.exports=  router;
