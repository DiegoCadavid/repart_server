const express = require("express");
const constructionRouter = express.Router();

// DEPENDENCES
const { body, header } = require("express-validator");
const { Op } = require("sequelize");
// const compareAuthUser = require("../middlewares/compareAuthUser"); Se desplazo a la seccion de middlewares
const cloudinary = require("cloudinary").v2;

// MIDDLEWARES
const existModelParam = require("../middlewares/existModelParam");
const existUniqueModelFields = require("../middlewares/existUniqueModelFields");
const validateErrors = require("../middlewares/validateErrors");
const validateJWT = require("../middlewares/validateJWT");
const validateRoles = require("../middlewares/validateRoles");
const compareAuthUser = require("../middlewares/compareAuthUser");
// Models DB
const Construction = require("../models/Construction");
const ConstructionImage = require("../models/ConstructionImage");
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
constructionRouter.get("/", async (req, res) => {
  try {
    // Solo mostramos las construcciones que el usuario a creado o de las cuales es cliente
    const constructions = await Construction.findAll({
      where: {
        status: true,
      },
      include: [
        { model: User, as: "client" },
        { model: User, as: "creator" },
        { model: ConstructionImage, as: "header" },
      ],
    });

    // Obtenemos todas las url de las headers de las construcciones
    const headerImagesId = constructions
      .map((construction) => construction.dataValues.header?.dataValues.image)
      .filter((image) => image);

    const urlImages = (
      await cloudinary.api.resources_by_ids(headerImagesId)
    ).resources.map((resource) => {
      return {
        url: resource.secure_url,
        id: resource.public_id,
      };
    });

    // Asignamos las imagenes
    constructions.forEach((rawConstruction) => {
      const headerId = rawConstruction.dataValues.header?.dataValues.image;

      if (headerId) {
        const urlImage = urlImages.find((image) => image.id == headerId);
        rawConstruction.dataValues.header.dataValues.url = urlImage.url;
      }
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
});

// Obtiene todas las construcciones de un usuario
constructionRouter.get(
  "/user/:user_id",
  [existModelParam(User, "user_id")],
  async (req, res) => {
    try {
      const { user } = req;

      // Solo mostramos las construcciones que el usuario a creado o de las cuales es cliente
      const constructions = await Construction.findAll({
        where: {
          status: true,
          [Op.or]: [{ create_by: user.id }, { client_id: user.id }],
        },
        include: [
          { model: User, as: "client" },
          { model: User, as: "creator" },
          { model: ConstructionImage, as: "header" },
        ],
      });

      // Agregamos el header image
      // Obtenemos todas las url de las headers de las construcciones
      const headerImagesId = constructions
        .map((construction) => construction.dataValues.header?.dataValues.image)
        .filter((image) => image);

      const urlImages = (
        await cloudinary.api.resources_by_ids(headerImagesId)
      ).resources.map((resource) => {
        return {
          url: resource.secure_url,
          id: resource.public_id,
        };
      });

      // Asignamos las imagenes
      constructions.forEach((construction) => {
        const headerId = construction.dataValues.header?.dataValues.image;

        if (headerId) {
          const urlImage = urlImages.find((image) => image.id == headerId);
          construction.dataValues.header.dataValues.url = urlImage.url;
        }
      });

      // Separamos las construcciones en las que el es cliente
      const userConstruction = constructions.filter((construction) => {
        const clientConstruction = construction.dataValues.client_id;
        if (clientConstruction === null) return false;
        if (clientConstruction != user.id) return false;

        return true;
      });

      // Separamos las construcciones que el ha creado
      const createdConstruction = constructions.filter((construction) => {
        const createdConstruction = construction.dataValues.create_by;
        if (createdConstruction === null) return false;
        if (createdConstruction != user.id) return false;

        return true;
      });

      //Eliminamos la propiedad contraseña de los usuarios para no enviarla con la response
      constructions.forEach((construction) => {
        delete construction.dataValues.creator.dataValues.password;
        if (construction.dataValues.client) {
          delete construction.dataValues.client.dataValues.password;
        }
      });

      res
        .status(200)
        .json({ user: userConstruction, created: createdConstruction });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// GET BY ID
constructionRouter.get(
  "/:id",
  [
    existModelParam(Construction, "id", [
      { model: User, as: "client" },
      { model: User, as: "creator" },
      { model: ConstructionImage, as: "header" },
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

      const headerImageId = construction.dataValues.header?.dataValues.image;
      if(headerImageId) {
          const resource = await cloudinary.api.resource(headerImageId);
          construction.dataValues.header.dataValues.url = resource.url;
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
    validateRoles(["admin"]),
    existModelParam(Construction, "id", [
      { model: User, as: "client" },
      { model: User, as: "creator" },
      { model: ConstructionImage, as: "header" },
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

       //Eliminamos la propiedad contraseña de los usuarios para no enviarla con la response
       delete construction.dataValues.creator.dataValues.password;
       if (construction.dataValues.client) {
         delete construction.dataValues.client.dataValues.password;
       }
       
       const headerImageId = construction.dataValues.header?.dataValues.image;
       if(headerImageId) {
           const resource = await cloudinary.api.resource(headerImageId);
           construction.dataValues.header.dataValues.url = resource.url;
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

// Asignar un usuario a una construccion mediante el correo electronico
constructionRouter.post(
  "/:id/client",
  [
    validateJWT,
    validateRoles(["admin"]),
    existModelParam(Construction, "id", [
      { model: User, as: "client" },
      { model: User, as: "creator" },
    ]),
    compareAuthUser(Construction, ["create_by"]),
    body("client_email").exists().isEmail(),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { construction } = req;
      const { client_email: email = "" } = req.body;

      const user = await User.findOne({
        where: {
          status: true,
          email,
        },
      });

      if (!user) {
        console.log(user.email);
        return res.status(400).json({
          msg: `No existe el usuario con el correo ${email}`,
        });
      }

      await construction.update({
        client_id: user.id,
      });

      await construction.save();

      res.status(200).json({
        email: user.email,
      });
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
