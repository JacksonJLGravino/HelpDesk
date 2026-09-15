import express from "express";
import { errorHandling } from "./middlewares/error-handling";
import { routes } from "./routes";
import uploadConfig from "@/configs/upload";

const app = express();

app.use(express.json());
app.use("/uploads", express.static(uploadConfig.UPLOADS_FOLDER));
app.use(routes);
app.use(errorHandling);

export { app };
