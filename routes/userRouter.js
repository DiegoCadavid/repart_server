const express = require("express");
const userRouter = express.Router();

// DEPENDENCES
const { body } = require("express-validator");
const bcript = require("bcryptjs");

// MIDDLEWARES
const existUniqueModelFields = require("../middlewares/existUniqueModelFields");
const validateErrors = require("../middlewares/validateErrors");
const existModelParam = require("../middlewares/existModelParam");
const validateJWT = require("../middlewares/validateJWT");

// MODELS DB
const User = require("../models/User");

// CRUD
// Create
userRouter.post(
  "/",
  [
    body("name").exists().isString().isLength({ max: 50, min: 5 }),
    body("last_name").exists().isString().isLength({ max: 50, min: 5 }),
    body("email").exists().isEmail(),
    body("password").exists().isString().isLength({ min: 8, max: 255 }),
    body("cc").exists().isString(),
    body("expedition_date").exists().isDate(),
    body("date_of_birth").exists().isDate(),
    body("phone").exists().isMobilePhone(),
    body("security_number").optional().isString(),
    body("image").optional().isString(),
    body("role").optional().isString(),
    existUniqueModelFields(User, ["email", "cc", "phone", "security_number"]),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { password, ...dataUser } = req.body;

      // Encriptamos la contraseña
      const passwordHash = bcript.hashSync(password, 10);

      // Creamos y guardamos el modelo en la db
      const user = await User.create({ password: passwordHash, ...dataUser });

      // Enviamos una respuesta
      res.status(200).json(user);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// Read
userRouter.get("/", async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        status: true,
      },
    });
    users.forEach((user) => {
      //Eliminamos la propiedad contraseña para no enviarla con la response
      delete user.dataValues.password;
      return user;
    });

    res.status(200).json(users);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      msg: "Contacte con el administrador",
    });
  }
});

// Read by id
userRouter.get("/:id", [existModelParam(User, "id")], (req, res) => {
  try {
    const { user } = req;

    //Eliminamos la propiedad contraseña para no enviarla con la response
    delete user.dataValues.password;

    res.status(200).json(user);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      msg: "Contacte con el administrador",
    });
  }
});

// Update
userRouter.put(
  "/:id",
  [
    validateJWT,
    existModelParam(User, "id"),
    body("name").optional().isString().isLength({ max: 50, min: 5 }),
    body("last_name").optional().isString().isLength({ max: 50, min: 5 }),
    body("email").optional().isEmail(),
    body("password").optional().isString().isLength({ min: 8, max: 255 }),
    body("cc").optional().isString(),
    body("expedition_date").optional().isDate(),
    body("date_of_birth").optional().isDate(),
    body("phone").optional().isMobilePhone(),
    body("security_number").optional().isString(),
    body("image").optional().isString(),
    body("role").optional().isString(),
    existUniqueModelFields(User, ["email", "cc", "phone", "security_number"]),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { user, authUser } = req;
      // Validamos si el usuario autenticado es el mismo que intenta actualizar
      if (authUser.id != user.id && authUser.role != "admin") {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

      // Si existe la contraseña la incriptamos
      if (req.body?.password) {
        req.body.password = bcript.hashSync(req.body.password, 10);
      }

      // Si la cuenta no la modifica un administrador no puede cambiar los siguientes parametros [role, security_number]
      if(req.body?.role && authUser.role != "admin") {
        delete req.body.role;
      }
      
      if(req.body?.security_number && authUser.role != "admin") {
        delete req.body.security_number;
      }

      // Actualizamos y guardamos el modelo en la db
      await user.update(req.body);
      await user.save();

      //Eliminamos la propiedad contraseña para no enviarla con la response
      delete user.dataValues.password;

      // Enviamos una respuesta
      res.status(200).json(user);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// Delete
userRouter.delete(
  "/:id",
  [validateJWT, existModelParam(User, "id")],
  async (req, res) => {
    try {
      const { user, authUser } = req;

      if (authUser.id != user.id && authUser.role != "admin") {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

      await user.update({ status: false });
      await user.save();

      //Eliminamos la propiedad contraseña para no enviarla con la response
      delete user.dataValues.password;
      res.status(200).json(user);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

module.exports = userRouter;
