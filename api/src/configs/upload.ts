import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";

const TMP_FOLDER = path.resolve(__dirname, "..", "..", "tmp");
const UPLOADS_FOLDER = path.resolve(__dirname, "..", "..", "uploads");

const MAX_FILE_SIZE = 1024 * 1024 * 2;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

const MULTER = {
  storage: multer.diskStorage({
    destination: TMP_FOLDER,
    filename(request, file, callback) {
      const fileHash = crypto.randomBytes(10).toString("hex");
      const filename = `${fileHash}-${file.originalname}`;

      return callback(null, filename);
    },
  }),
};

export default {
  TMP_FOLDER,
  UPLOADS_FOLDER,
  MULTER,
  MAX_FILE_SIZE,
  ACCEPTED_IMAGE_TYPES,
};
