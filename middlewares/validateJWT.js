const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Verifica la existencia y valida el JWT 
 * @returns null or 401 response
 */
const validateJWT = (req, res, next) => {
  try {
    const { token } = req.headers;

    if (!token) {
      return res.status(401).json({
        msg: "Usuario no autenticado",
      });
    }

    // Validamos el JWT
    jwt.verify(token, process.env.JWT_PASSWORD, async (error, decoded) => {
      if (error) {
        return res.status(401).json({
          msg: "Token no valido",
        });
      }

      const user = await User.findByPk(decoded.id);

      //Eliminamos la propiedad contraseña para no enviarla con la response
      delete user.dataValues.password;

      // Guardamos en la request el usuario autenticado
      req.authUser = user;

      next();
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      msg: "Contacte con el administrador",
    });
  }
};

module.exports = validateJWT;