const express = require("express");
const constructionRouter = express.Router();

// DEPENDENCES
const { body } = require("express-validator");
const { Op } = require("sequelize");
const compareAuthUser = require("../middlewares/compareAuthUser");

// MIDDLEWARES
const existModelParam = require("../middlewares/existModelParam");
const existUniqueModelFields = require("../middlewares/existUniqueModelFields");
const validateErrors = require("../middlewares/validateErrors");
const validateJWT = require("../middlewares/validateJWT");
const validateRoles = require("../middlewares/validateRoles");

// Models DB
const Construction = require("../models/Construction");
const User = require("../models/User");

// CREATE CONSTRUCTION
constructionRouter.post(
  "/",
  [
    validateJWT,
    validateRoles(["admin"]),
    existUniqueModelFields(Construction, ["name"]),
    body("client_id").optional().isInt(),
    body("name").exists().isString().isLength({ min: 3, max: 255 }),
    body("address").optional().isString().isLength({ max: 255 }),
    body("info").optional().isString().isLength({ max: 255 }),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { client_id, name, info, address } = req.body;
      const { authUser } = req;

      const constructionData = {
        client_id,
        name,
        info,
        address,
        create_by: authUser.id,
      };

      const construction = await Construction.create(constructionData);

      res.status(200).json(construction);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// GET ALL CONSTRUCTIONS
constructionRouter.get(
  "/",
  async (req, res) => {
    try {
      // Solo mostramos las construcciones que el usuario a creado o de las cuales es cliente
      const constructions = await Construction.findAll({
        where: {
          status: true,
        },
        include: [
          { model: User, as: "client" },
          { model: User, as: "creator" },
        ],
      });

      //Eliminamos la propiedad contraseña de los usuarios para no enviarla con la response
      constructions.forEach((construction) => {
        delete construction.dataValues.creator.dataValues.password;
        if (construction.dataValues.client) {
          delete construction.dataValues.client.dataValues.password;
        }
      });

      res.status(200).json(constructions);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// Obtiene todas las construcciones de un usuario
constructionRouter.get(
  "/user/:user_id",
  [existModelParam(User, "user_id")],
  async (req, res) => {
    try {
      const { user } = req;

      console.log(user.id);

      // Solo mostramos las construcciones que el usuario a creado o de las cuales es cliente
      const constructions = await Construction.findAll({
        where: {
          status: true,
          [Op.or]: [{ create_by: user.id }, { client_id: user.id }],
        },
        include: [
          { model: User, as: "client" },
          { model: User, as: "creator" },
        ],
      });

      //Eliminamos la propiedad contraseña de los usuarios para no enviarla con la response
      constructions.forEach((construction) => {
        delete construction.dataValues.creator.dataValues.password;
        if (construction.dataValues.client) {
          delete construction.dataValues.client.dataValues.password;
        }
      });

      res.status(200).json(constructions);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// GET BY ID
// Obtiene una construccion especifica del usuario autenticado
constructionRouter.get(
  "/:id",
  [
    existModelParam(Construction, "id", [
      { model: User, as: "client" },
      { model: User, as: "creator" },
    ]),
  ],
  async (req, res) => {
    try {
      const { construction } = req;

      //Eliminamos la propiedad contraseña de los usuarios para no enviarla con la response
      delete construction.dataValues.creator.dataValues.password;
      if (construction.dataValues.client) {
        delete construction.dataValues.client.dataValues.password;
      }

      res.status(200).json(construction);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// UPDATE
constructionRouter.put(
  "/:id",
  [
    validateJWT,
    validateRoles(["admin", "client"]),
    existModelParam(Construction, "id", [
      { model: User, as: "client" },
      { model: User, as: "creator" },
    ]),
    existUniqueModelFields(Construction, ["name"]),
    compareAuthUser(Construction, ["create_by"]),
    body("client_id").optional().isInt(),
    body("name").optional().isString().isLength({ min: 3, max: 255 }),
    body("address").optional().isString().isLength({ max: 255 }),
    body("info").optional().isString().isLength({ max: 255 }),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { construction } = req;

      await construction.update(req.body);
      await construction.save();

      res.status(200).json(construction);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// DELETE
constructionRouter.delete(
  "/:id",
  [
    validateJWT,
    existModelParam(Construction, "id", [
      { model: User, as: "client" },
      { model: User, as: "creator" },
    ]),
    compareAuthUser(Construction, ["create_by"]),
  ],
  async (req, res) => {
    try {
      const { construction } = req;

      await construction.update({ status: false });
      await construction.save();

      res.status(200).json(construction);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

module.exports = constructionRouter;
