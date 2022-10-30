const { validationResult } = require("express-validator");

/**
 * 
 * @returns null or 400 response
 */
const validateErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json( errors.array({onlyFirstError: true}) );
  }

  next();
};

module.exports = validateErrors;
