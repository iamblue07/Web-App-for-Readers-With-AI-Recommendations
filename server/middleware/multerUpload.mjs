import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });

const secondStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploadsMessages");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
})
  
const upload = multer({ storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      return cb(new Error("Doar fisiere JPEG, JPG si PNG sunt permise!"));
    }
  }
});

const  secondUpload = multer({storage: secondStorage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if(mimetype && extname) {
      return cb(null, true);
    } else {
      return cb(new Error("Doar fisiere JPEG, JPG, PNG si PDF sunt permise!"));
    }
  }
})

export {
  upload,
  secondUpload
}