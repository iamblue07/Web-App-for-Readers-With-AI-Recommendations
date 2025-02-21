import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/"); // Folderul unde se salvează fișierele
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Generare nume unic
    },
  });
  
  const upload = multer({ storage: storage,
    fileFilter: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);
      
      if (mimetype && extname) {
          return cb(null, true);
      } else {
          return cb(new Error("Doar fișiere JPEG, JPG și PNG sunt permise!"));
      }
    }
});

  export default upload;