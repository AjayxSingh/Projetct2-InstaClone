var express = require('express');
var router = express.Router();
const userModel = require('./users');
const passport = require('passport');
const localStrategy  = require('passport-local');
const upload = require('./multer');
const postModel = require('./posts');


passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function(req, res) {
  res.render('index', {footer: false});
});

router.get('/login', function(req, res) {
  res.render('login', {footer: false});
});

router.get('/feed', isLoggedIn , async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user})
  const posts = await postModel.find().populate("user");
  res.render('feed', {footer: true , posts , user} );
});

router.get('/profile', isLoggedIn ,async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user}).populate('posts');
  res.render('profile', {footer: true , user});
});

router.get('/search', isLoggedIn ,function(req, res) {
  res.render('search', {footer: true});
});

router.get('/edit', isLoggedIn ,async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user})
  res.render('edit', {footer: true , user});
});

router.get('/like/:id' , isLoggedIn , async function(req,res){
  const user = await userModel.findOne({username: req.session.passport.user});
  const post = await postModel.findOne({_id: req.params.id});
  //if liked then dislike otherwise like
  if(post.likes.indexOf(user._id) === -1){
    post.likes.push(user._id)
  }
  else{
    post.likes.splice(post.likes.indexOf(user._id) , )
  }

  await post.save();
  res.redirect('/feed')
})


router.get('/upload', isLoggedIn ,function(req, res) {
  res.render('upload', {footer: true});
});

router.post('/profile',async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user})
  res.render('profile', {footer: true , user});
});

router.post('/register' , function(req,res, next){
  const userData =  new userModel({
    username:req.body.username,
    name: req.body.name,
    email:req.body.email,

  });
  userModel.register(userData , req.body.password)
  .then(function(){
    passport.authenticate('local')(req , res , function(){
      res.redirect('profile');
    });
  });
})

router.post('/login' ,passport.authenticate("local",{
  failureRedirect:"/",
  successRedirect:'/profile',
}) );

router.post('/update' , isLoggedIn , upload.single("image"), async function(req,res,next){
  const user = await userModel.findOne({username: req.session.passport.user});
  console.log(user);
  user.username = req.body.username 
  user.name = req.body.name
  user.bio = req.body.bio
  if(req.file) user.profileImage = req.file.filename;
  await user.save();
  res.redirect('/profile');
})


router.post('/upload', isLoggedIn, upload.single('image'),async function(req,res){
  const user = await userModel.findOne({username: req.session.passport.user});
  const post = await postModel.create({
    picture: req.file.filename,
    caption: req.body.caption,
    user: user._id,
  });
  user.posts.push(post._id);
    await user.save();
    res.redirect('/feed')
});


router.get('/logout' , function(req,res, next) {
  req.logOut(function(err){
    res.redirect('/')
  })
})

router.get('/username/:username' , isLoggedIn , async function(req,res){
  const searchTerm = new RegExp(`${req.params.username }` , 'i')
  const users = await userModel.find({username: searchTerm})
  res.json(users);
})

function isLoggedIn( req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
}

module.exports = router;
