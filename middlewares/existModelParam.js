const { Model } = require("sequelize");

/**
 * [MIDDLEWARE] que verifica la existencia de un modelo 
 * a base de los param de una peticion y deja guardado
 * en la request el modelo existente
 * 
 * @param {Model} ModelDb 
 * @param {string} paramPK 
 * @returns null or 404 response
 */
const existModelParam = (ModelDb = Model, paramPK = "", includes = []) => {
  return async (req, res, next) => {
    const pk = req.params[paramPK];

    if (!pk) {
      console.log(`El parametro ${paramPK} no existe`);
      return res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }

    try {
      const modelDb = await ModelDb.findOne({
        where: {
          id: pk,
          status: true,
        },
        include: includes
      });

      if (!modelDb) {
        return res.status(404).json({
          value: pk,
          msg: `el ${ModelDb.name.toLowerCase()} no fue encontrado`,
          param: paramPK,
          location: "params"
        });
      }

      req[ModelDb.name.toLowerCase()] = modelDb;
      next();
    } catch (error) {
      console.log(error);
      res.status(500).json({
        msg: "Contante con el administrador",
      });
    }
  };
};

module.exports = existModelParam;
