import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

const uploadsDir = 'uploads/';

// Create the uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // Set the maximum file size to 5MB
  }
});

const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  upload.single('resume')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Handle Multer errors
      console.error('Multer Error:', err);
      return res.status(400).json({ error: err.message });
    } else if (err) {
      // Handle other errors
      console.error('File Upload Error:', err);
      return res.status(400).json({ error: err.message });
    }

    // File uploaded successfully
    next();
  });
};

export default uploadMiddleware;
