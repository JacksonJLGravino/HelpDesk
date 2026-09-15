import fs from "node:fs";
import path from "node:path";

import uploadConfig from "@/configs/upload";

class DiskStorage {
  async saveFile(file: string) {
    const tmpPath = path.resolve(uploadConfig.TMP_FOLDER, file);

    const destinationPath = path.resolve(uploadConfig.UPLOADS_FOLDER, file);

    await fs.promises.mkdir(uploadConfig.UPLOADS_FOLDER, { recursive: true });

    await fs.promises.rename(tmpPath, destinationPath);

    return file;
  }

  async deleteFile(file: string, type: "tmp" | "upload") {
    const folder =
      type === "tmp" ? uploadConfig.TMP_FOLDER : uploadConfig.UPLOADS_FOLDER;

    const filePath = path.resolve(folder, file);

    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      console.log(error);
    }
  }
}

export { DiskStorage };
