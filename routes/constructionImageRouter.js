const express = require("express");
const compareAuthUser = require("../middlewares/compareAuthUser");
const compareModels = require("../middlewares/compareModels");
const constructionImageRouter = express.Router();

// DEPENDENCES
const cloudinary = require("cloudinary").v2;

// MIDDLEWARES
const existModelParam = require("../middlewares/existModelParam");
const validateErrors = require("../middlewares/validateErrors");
const validateJWT = require("../middlewares/validateJWT");
const validateRoles = require("../middlewares/validateRoles");

// Models DB
const Construction = require("../models/Construction");
const ConstructionImage = require("../models/ConstructionImage");

// CREATE
constructionImageRouter.post(
  "/:construction_id/images",
  [
    validateJWT,
    validateRoles(["admin"]),
    existModelParam(Construction, "construction_id"),
    compareAuthUser(Construction, ["create_by"]),
    validateErrors,
  ],
  (req, res) => {
    try {
      const { construction, files } = req; // => De aqui sacamos el ID

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
            folder: `${process.env.CLOUDINARY_ROOT}/constructions/${construction.id}`,
          },
          async (error, result) => {
            if (error) {
              console.log(error);
              return res.status(500).json({
                msg: "Error al subir la imagen, contacte con el administrador",
              });
            }

            // Guardamos el id de la imagen en la base de datos
            const constructionImage = await ConstructionImage.create({
              image: result.public_id,
              construction_id: construction.id,
            });

            res.status(200).json({
              url: result.secure_url,
              ...constructionImage.dataValues,
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

// READ ALL
constructionImageRouter.get(
  "/:construction_id/images",
  [existModelParam(Construction, "construction_id")],
  async (req, res) => {
    try {
      const { construction } = req;

      const constructionImages = await ConstructionImage.findAll({
        where: {
          status: true,
          construction_id: construction.id,
        },
      });

      if (constructionImages.length == 0) {
        return res.status(200).json([]);
      }

      // Obtenemos todas las imagenes mediante el ID
      const imagesUrl = await cloudinary.api.resources_by_ids(
        constructionImages.map((image) => image.dataValues.image)
      );

      // Creamos el array de images con su respectiva url
      const imagesWithUrl = constructionImages.map((image) => {
        const url =
          imagesUrl.resources[
            imagesUrl.resources
              .map((rm) => rm.public_id)
              .findIndex((m) => m == image.image)
          ].secure_url;

        return {
          url,
          ...image.dataValues,
        };
      });

      // Enviamos la peticion
      res.status(200).json(imagesWithUrl);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

constructionImageRouter.get(
  "/:construction_id/images/:image_id",
  [
    existModelParam(Construction, "construction_id"),
    existModelParam(ConstructionImage, "image_id"),
    compareModels(
      { Model: ConstructionImage, key: "construction_id" },
      { Model: Construction, key: "id" }
    ),
  ],
  async (req, res) => {
    try {
      const { construction_image: constructionImage } = req;

      const urlImage = (await cloudinary.api.resource(constructionImage.image))
        .secure_url;

      res.status(200).json({
        url: urlImage,
        ...constructionImage.dataValues,
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
constructionImageRouter.delete(
  "/:construction_id/images/:image_id",
  [
    validateJWT,
    validateRoles(["admin"]),
    existModelParam(Construction, "construction_id"),
    existModelParam(ConstructionImage, "image_id"),
    compareModels(
      { Model: ConstructionImage, key: "construction_id" },
      { Model: Construction, key: "id" }
    ),
  ],
  async (req, res) => {
    try {
      const { construction_image: constructionImage } = req;

      // No se valida que solo los que crearon la construccion pueda subir imagenes
      // a esta por temas de seguridad, es decir, si un trabajador sube una imagen
      // innapropiada cualquier administrador pueda borrarla

      await constructionImage.update({
        status: false,
      });

      await constructionImage.save();

      res.status(200).json(constructionImage);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

module.exports = constructionImageRouter;
