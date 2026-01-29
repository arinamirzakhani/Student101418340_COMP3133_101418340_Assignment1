const { body } = require("express-validator");

const signupValidators = [
  body("username").isLength({ min: 3 }).withMessage("username must be at least 3 chars"),
  body("email").isEmail().withMessage("email must be valid"),
  body("password").isLength({ min: 6 }).withMessage("password must be at least 6 chars"),
];

module.exports = { signupValidators };
