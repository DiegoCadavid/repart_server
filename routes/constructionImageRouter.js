const express = require("express");
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
    validateErrors,
  ],
  (req, res) => {
    try {
      const { construction, files, authUser } = req; // => De aqui sacamos el ID

      // Solo los que crearon la obra pueden subir imagenes a esta
      if (construction.create_by != authUser.id) {
        return res.status(403).json({
          msg: "no permitido",
        });
      }

      // Realizamos validaciones
      if (!files?.image) {
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
          { folder: `constructions/${construction.id}` },
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
          status: 1,
        },
      });

      let constructionImagesWithUrl = [];
      for (let i = 0; i < constructionImages.length; i++) {
        const constructionImage = constructionImages[i];
        const constructionImageUrl = await cloudinary.api.resource(
          constructionImage.dataValues.image
        );
        constructionImagesWithUrl.push({
          url: constructionImageUrl.secure_url,
          ...constructionImage.dataValues,
        });
      }

      res.status(200).json(constructionImagesWithUrl);
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
  [existModelParam(Construction, "construction_id")],
  [existModelParam(ConstructionImage, "image_id")],
  async (req, res) => {
    try {
      const { construction, construction_image: constructionImage } = req;

      if (construction.id != constructionImage.construction_id) {
        return res.status(404).json({
          value: req.params.image_id,
          msg: "el construction_image no fue encontrado",
          param: "image_id",
          location: "params",
        });
      }

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
  [validateJWT, validateRoles(["admin"])],
  [existModelParam(Construction, "construction_id")],
  [existModelParam(ConstructionImage, "image_id")],
  async (req, res) => {
    try {
      const { construction, construction_image: constructionImage } = req;


      // No se valida que solo los que crearon la construccion pueda subir imagenes
      // a esta por temas de seguridad, es decir, si un trabajador sube una imagen
      // innapropiada cualquier administrador pueda borrarla

      if (construction.id != constructionImage.construction_id) {
        return res.status(404).json({
          value: req.params.image_id,
          msg: "el construction_image no fue encontrado",
          param: "image_id",
          location: "params",
        });
      }

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