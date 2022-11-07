const express = require("express");
const userRouter = express.Router();

// DEPENDENCES
const { body } = require("express-validator");
const bcript = require("bcryptjs");
const cloudinary = require("cloudinary").v2;

// MIDDLEWARES
const existUniqueModelFields = require("../middlewares/existUniqueModelFields");
const validateErrors = require("../middlewares/validateErrors");
const existModelParam = require("../middlewares/existModelParam");
const validateJWT = require("../middlewares/validateJWT");

// MODELS DB
const User = require("../models/User");
const compareAuthUser = require("../middlewares/compareAuthUser");

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
    compareAuthUser(User, ["id"]),
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

      // Si existe la contraseña la incriptamos
      if (req.body?.password) {
        req.body.password = bcript.hashSync(req.body.password, 10);
      }

      // Si la cuenta no la modifica un administrador no puede cambiar los siguientes parametros [role, security_number]
      if (req.body?.role && authUser.role != "admin") {
        delete req.body.role;
      }

      if (req.body?.security_number && authUser.role != "admin") {
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
  [validateJWT, existModelParam(User, "id"), compareAuthUser(User, ["id"])],
  async (req, res) => {
    try {
      const { user } = req;

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

// upload/change photo
userRouter.post(
  "/image/:id",
  [validateJWT, existModelParam(User, "id"), compareAuthUser(User, ["id"])],
  async (req, res) => {
    try {
      const { user, files } = req;
      delete user.dataValues.password;

      // Realizamos validaciones
      if (!files?.image || !files) {
        return res.status(400).json({
          msg: "Debe de introducir una imagen",
        });
      }

      if (files.image.length) {
        return res.status(400).json({
          msg: "Solo puede introducir una imagen",
        });
      }

      // Subimos la imagen a cloudinary
      cloudinary.uploader
        .upload_stream(
          {
            folder: `${process.env.CLOUDINARY_ROOT}/users/${user.id}`,
          },
          async (error, result) => {
            if (error) {
              console.log(error);
              return res.status(500).json({
                msg: "Error al subir la imagen, contacte con el administrador",
              });
            }

            await user.update({
              image: result.public_id,
            });

            await user.save();

            res.status(200).json({
              url: result.secure_url,
              id: user.image,
            });
          }
        )
        .end(files.image.data);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// get user photo
userRouter.get(
  "/image/:id",
  [existModelParam(User, "id")],
  async (req, res) => {
    try {
      const { user } = req;
      delete user.dataValues.password;

      // Validamos si el usuario tiene una imagen
      if (!user.image) {
        return res.status(200).json({
          url: "",
        });
      }

      // Obtenemos la imagen
      const result = await cloudinary.api.resource(user.image);
      res.status(200).json({
        url: result.secure_url,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// delete photo
userRouter.delete(
  "/image/:id",
  [validateJWT, existModelParam(User, "id"), compareAuthUser(User, ["id"])],
  async (req, res) => {
    try {
      const { user } = req;

      if (!user.image) {
        return res.status(400).json({
          msg: "El usuario no tiene imagen",
        });
      }

      await user.update({
        image: null 
      })

      await user.save();

      res.status(200).json({
        msg: "imagen eliminada"
      })
      
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

module.exports = userRouter;
