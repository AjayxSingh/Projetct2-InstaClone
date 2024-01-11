const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = mongoose.Schema({
  username:String,
  name: String,
  email:String,
  password:String,
  bio:String,
  profileImage: String,
  posts:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'post',
  }],
});

userSchema.plugin(plm);
module.exports  = mongoose.model("user" , userSchema);