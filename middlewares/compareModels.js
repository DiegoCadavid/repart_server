const compareModels = (firstModel = {}, secondModel = {}) => {
  return (req, res, next) => {
    try {
      const firstReqModel = req[firstModel.Model.name.toLowerCase()];
      const secondReqModel = req[secondModel.Model.name.toLowerCase()];

      if (!firstReqModel) {
        throw new Error(
          `Se debe validar primero el middleware de validate params de el modelo ${firstModel.Model.name}`
        );
      }

      if (!secondReqModel) {
        throw new Error(
          `Se debe validar primero el middleware de validate params de el modelo ${secondModel.Model.name}`
        );
      }

      if (firstReqModel[firstModel.key] != secondReqModel[secondModel.key]) {
        return res.status(403).json({
          msg: `El ${firstModel.Model.name.toLowerCase()} no pertenece a esa ${secondModel.Model.name.toLowerCase()}`,
        });
      }

      next();
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  };
};

module.exports = compareModels;
