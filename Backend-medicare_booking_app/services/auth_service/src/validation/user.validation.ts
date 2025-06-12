import Joi from "joi";

const createUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email không hợp lệ",
    "any.required": "Email là bắt buộc",
  }),
  password: Joi.string()
    .pattern(new RegExp("^[A-Z][a-zA-Z0-9]{5,}$"))
    .required()
    .messages({
      "string.pattern.base":
        "Mật khẩu phải bắt đầu bằng chữ in hoa và tối đa 10 ký tự",
      "any.required": "Mật khẩu là bắt buộc",
    }),
  userType: Joi.string().required().messages({
    "any.required": "Loại người dùng là bắt buộc",
  }),
});

export { createUserSchema };
