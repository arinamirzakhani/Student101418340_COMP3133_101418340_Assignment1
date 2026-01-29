const { body } = require("express-validator");

const employeeValidators = [
  body("first_name").notEmpty().withMessage("first_name is required"),
  body("last_name").notEmpty().withMessage("last_name is required"),
  body("email").isEmail().withMessage("employee email must be valid"),
  body("gender").optional().isIn(["Male", "Female", "Other"]).withMessage("gender must be Male/Female/Other"),
  body("designation").notEmpty().withMessage("designation is required"),
  body("salary").isFloat({ min: 1000 }).withMessage("salary must be >= 1000"),
  body("date_of_joining").notEmpty().withMessage("date_of_joining is required"),
  body("department").notEmpty().withMessage("department is required"),
];

module.exports = { employeeValidators };
