const multer = require('multer');
const   { v4 : uuidv4} = require('uuid');
const path = require('path');//Gives the extension of the file given

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, './public/images/uploads')//Destination folder for uploads
    },
    filename: function(req,file,cb){

        const uniqueFilename = uuidv4();//Generating a unique filename 
        cb(null, uniqueFilename+path.extname(file.originalname));// user unifilename as the name of the uploaded file.
    }
});

const upload = multer({storage:storage});

module.exports = upload;