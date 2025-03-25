

const multer = require("multer");
const path = require("path");
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './public'); 
//     },
//     filename: function (req, file, cb) {
//         cb(null, `${Date.now()}-${file.originalname}`); 
//     }
// });


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = 'productData'; // Default folder
        let uploadPath = path.join( 'public', folder);

        // Check userType from request and determine folder
        if (req.body.roll === 'admin') {
            folder = 'adminData';
             uploadPath = path.join( 'public', folder);
        }else if(req.body.roll === 'client'){
            folder = 'clientData'
             uploadPath = path.join( 'public', folder);
        }
        
        uploadPath = path.join( 'public', folder);
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({storage});

module.exports = upload;



// // req.file will be like this : 

// //   {
// //     fieldname: 'avatar',
// //     originalname: 'profile.jpg',
// //     encoding: '7bit',
// //     mimetype: 'image/jpeg',
// //     destination: '/tmp/my-uploads',
// //     filename: 'avatar-1673024571827-568745123',
// //     path: '/tmp/my-uploads/avatar-1673024571827-568745123',
// //     size: 34567
// //   }
  
  