const validateRoles = (roles = []) => {
  return (req, res, next) => {
    try {
      const { authUser } = req;

      if (!authUser) {
        return res.status(401).json({
          msg: "Usuario no autenticado",
        });
      }

      if (!roles.includes(authUser.role)) {
        return res.status(401).json({
          msg: `Debes tener el rol de [${roles}]`,
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


module.exports = validateRoles;