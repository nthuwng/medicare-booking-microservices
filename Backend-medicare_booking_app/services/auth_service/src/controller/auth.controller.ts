import { Request, Response } from "express";
import { handleRegister, hashPassword } from "../services/auth.services";
import { createUserSchema } from "../validation/user.validation";

const postRegister = async (req: Request, res: Response) => {
  try {
    const { email, password, userType } = req.body;
    const { error } = createUserSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }
    const newPassword = await hashPassword(password);

    const user = await handleRegister(email, newPassword, userType);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          userType: user.userType,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      message: error,
    });
  }
};

export { postRegister };
