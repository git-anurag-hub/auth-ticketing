import express from "express";
import { body, validationResult } from "express-validator";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { validateRequest, BadRequestError } from "@simptickets/common";
import { User } from "../models/user";
import { Password } from "../services/password";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid."),
    body("password").trim().notEmpty().withMessage("Password required."),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError("Invalid Credentials.");
    }
    const passwordmatch = await Password.compare(existingUser.password, password);
    if (!passwordmatch) {
      throw new BadRequestError("Invalid Credentials.");
    }
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!
    );
    req.session = { jwt: userJwt };
    res.status(200).send(existingUser);
  }
);

export { router as signInRouter };
