const { Model } = require("sequelize");

/**
 * [MIDDLEWARE] Compara los campos del body con los de la DB para validar si son unicos
 * 
 * @param {Model} ModelDb 
 * @param {Array} fieldsInput 
 * @returns null or 400 response
 */
const existUniqueModelFields = (ModelDb = Model, fieldsInput = []) => {
  return async (req, res, next) => {
    let uniqueErrors = [];
    let fields = [];

    fieldsInput.forEach((fieldInput) => {
      if (Object.keys(ModelDb.getAttributes()).includes(fieldInput)) {
        fields.push(fieldInput);
      }
    });

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const fieldData = req.body[field];

      if (!fieldData) {
        continue;
      }

      const modelDb = await ModelDb.findOne({
        where: {
          [field]: fieldData,
        },
      });

      if (modelDb) {
        uniqueErrors.push({
          value: fieldData,
          msg: `${fieldData} ya existe`,
          param: field,
          location: "body"
        });
      }
    }

    if (uniqueErrors.length > 0) {
      return res.status(400).json(uniqueErrors);
    }

    next();
  };
};

module.exports = existUniqueModelFields;
