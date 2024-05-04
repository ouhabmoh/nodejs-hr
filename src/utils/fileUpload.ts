import fs from 'fs';
import path from 'path';

export const uploadFile = async (file: any): Promise<string> => {
  const uploadDir = 'uploads/';

  // Create the uploads directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  const fileExtension = path.extname(file.originalname);
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExtension}`;
  const filePath = path.join(uploadDir, fileName);

  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(filePath);
    fileStream.on('error', (err) => {
      reject(err);
    });
    fileStream.on('finish', () => {
      resolve(filePath);
    });
    fileStream.end(file.buffer);
  });
};
