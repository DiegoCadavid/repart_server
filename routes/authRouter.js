const express = require("express");
const authRouter = express.Router();

// DEPENDENCES
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");

// MIDDLEWARES
const validateErrors = require("../middlewares/validateErrors");
const validateJWT = require("../middlewares/validateJWT");

// MODELS DB
const User = require("../models/User");

// Login
authRouter.post(
  "/login",
  [body("email").exists().isEmail(), body("password").exists(), validateErrors],
  async (req, res) => {
    try {
      const { password, email } = req.body;
      // Verificamos si el email existe
      const user = await User.findOne({
        where: {
          email,
        },
      });

      if (!user) {
        return res.status(404).json({
          msg: "El usuario no existe",
        });
      }

      // Validamos si al contraseña es correcta
      const matchPassword = bcrypt.compareSync(password, user.password);
      if (!matchPassword) {
        return res.status(401).json({
          msg: "Contraseña incorrecta",
        });
      }

      //Creamos el JWT
      const token = jwt.sign({ id: user.id }, process.env.JWT_PASSWORD);
      res.status(200).json({
        token,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// Verificar token
authRouter.post("/verify",[validateJWT], async (req, res) => {
  // Verificamos si introdujo un token
  try { 
    const { authUser } = req;
    
    if(!authUser) {
      return res.status(401).json({
        msg : "Usuario no autenticado"
      })
    }

    res.status(200).json(authUser);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      msg: "Contacte con el administrador",
    });
  }
});

module.exports = authRouter;
