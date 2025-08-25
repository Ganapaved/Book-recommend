const passport = require('passport')
const LoacalStartegy = require('passport-local').Strategy;
const User = require('./models/User');
passport.use(new LoacalStartegy(async (username , password , done)=>{
    try{
        //  console.log('Recieved Credintials :',username,password);
        const user = await User.findOne({username : username});
        if(!user){
            return done(null,false,{message : 'Incorrect username'});
        }
        const isPasswordmatch = await user.comparePassword(password);
        if(isPasswordmatch){
            return done(null,user);
        }
        else{
            return done(null,false,{meaasge : 'Incorrect Password!'});
        }
        
    }catch(err){
        return done(err);
    }
}))

module.exports = passport;
