const comapareAuthUser = (Model, keys = []) => {
  return (req, res, next) => {
    try {
      const { authUser } = req;

      if (!authUser) {
        return res.status(401).json({
          msg: "Usuario no autenticado",
        });
      }
      // Obtenemos el modelo de la req
      const modelReq = req[Model.name.toLowerCase()];

      if (!modelReq) {
        throw new Error(
          `Se debe validar primero el middleware de validate params de el modelo ${firstModel.Model.name}`
        );
      }

      const modelKeysValue = keys.map((key) => {
        return { keyName: key, value: modelReq[key] };
      });

      //Comparamos con el usuario autenticado
      if( !modelKeysValue.map( ({ value }) => value ).includes(authUser.id) ){
        return res.status(403).json({
          msg: "No permitido",
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

module.exports = comapareAuthUser;
