import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

const uploadsDir = 'uploads/';

// Create the uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const uploadFile = async (file: any): Promise<string> => {
  try {
    console.log('ffffffffffffffffffffffffffffffff', file.originalname);
    const fileExtension = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);
    console.log('uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu');
    console.log('fillllllllllle paaaaaaaaaaaaaath', filePath);

    console.log(file.buffer);
    await fsPromises.writeFile(filePath, file.buffer);
    return filePath;
  } catch (err) {
    console.error('Error uploading file:', err);
    throw err;
  }
};
