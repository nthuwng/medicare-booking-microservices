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

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    "any.required": "Vui lòng nhập mật khẩu cũ",
  }),
  newPassword: Joi.string()
    .pattern(new RegExp("^[A-Z][a-zA-Z0-9]{5,}$"))
    .required()
    .messages({
      "string.pattern.base":
        "Mật khẩu phải bắt đầu bằng chữ in hoa và tối đa 10 ký tự",
      "any.required": "Mật khẩu là bắt buộc",
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Mật khẩu xác nhận không khớp với mật khẩu mới",
      "any.required": "Vui lòng xác nhận mật khẩu mới",
    }),
});

export { createUserSchema, changePasswordSchema };
