import { env } from "../env";
import type { SignOptions } from "jsonwebtoken";

export const authConfig = {
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: "1d" as SignOptions["expiresIn"],
  },
};
