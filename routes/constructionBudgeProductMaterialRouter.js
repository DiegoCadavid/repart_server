const express = require("express");
const constructionBudgeProductMaterialRouter = express.Router();
const { body } = require("express-validator");

const existModelParam = require("../middlewares/existModelParam");
const validateConstructionBudgeProduct = require("../middlewares/validateConstructionBudgeProduct");
const validateErrors = require("../middlewares/validateErrors");
const validateJWT = require("../middlewares/validateJWT");
const validateRoles = require("../middlewares/validateRoles");

const Budge = require("../models/Budge");
const Construction = require("../models/Construction");
const Material = require("../models/Material");
const MaterialProduct = require("../models/MaterialProduct");
const Product = require("../models/Product");

// CREATE MATERIAL PRODUCT
constructionBudgeProductMaterialRouter.post(
  "/:construction_id/budge/:budge_id/product/:product_id/material",
  [
    validateJWT,
    validateRoles(["admin"]),
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id"),
    existModelParam(Product, "product_id"),
    validateConstructionBudgeProduct,
    body("material_id").exists().isInt(),
    body("amount").exists().isFloat(),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { product, authUser, construction } = req;
      const { material_id, amount } = req.body;

      // Verificamos si el material existe
      const material = await Material.findOne({
        where: {
          id: material_id,
        },
      });

      // Solo los dueños de la construccion pueden agregar materiales de productos
      if( construction.create_by != authUser.id ) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }


      if (!material) {
        return res.status(400).json({
          msg: "El material no existe",
        });
      }

      const materialProduct = await MaterialProduct.create({
        product_id: product.id,
        material_id: material.id,
        amount,
      });

      res.status(200).json(materialProduct);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// GET MATERIALS PRODUCTS
constructionBudgeProductMaterialRouter.get(
  "/:construction_id/budge/:budge_id/product/:product_id/material",
  [
    validateJWT,
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id"),
    existModelParam(Product, "product_id"),
    validateConstructionBudgeProduct,
  ],
  async (req, res) => {
    try {
      const { product, construction, authUser } = req;

        // Solo los dueños o clientes de la construccion pueden obtener materiales de productos
        if( construction.create_by != authUser.id && construction.client_id != authUser.id ) {
          return res.status(403).json({
            msg: "No permitido",
          });
        }
  

      const materialsProduct = await MaterialProduct.findAll({
        where: {
          status: true,
          product_id: product.id,
        },
        include: [
          {
            model: Material,
            as: "material",
          },
        ],
      });

      res.status(200).json(materialsProduct);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// GET MATERIAL
constructionBudgeProductMaterialRouter.get(
  "/:construction_id/budge/:budge_id/product/:product_id/material/:material_id",
  [
    validateJWT,
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id"),
    existModelParam(Product, "product_id"),
    existModelParam(MaterialProduct, "material_id", [
      { model: Material, as: "material" },
    ]),
    validateConstructionBudgeProduct,
  ],
  async (req, res) => {
    try {
      const { material_product: material, product, construction, authUser } = req;

      // Solo los dueños o clientes de la construccion pueden obtener los materiales de productos
      if (construction.create_by != authUser.id && construction.client_id != authUser.id) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

      // Si el material no coincide con el producto
      if (material.product_id != product.id) {
        return res.status(404).json({
          value: req.params.material_id,
          msg: "el material_product no fue encontrado",
          param: "material_id",
          location: "params",
        });
      }

      res.status(200).json(material);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// UPDATE MATERIAL
constructionBudgeProductMaterialRouter.put(
  "/:construction_id/budge/:budge_id/product/:product_id/material/:material_id",
  [
    validateJWT,
    validateRoles(["admin"]),
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id"),
    existModelParam(Product, "product_id"),
    existModelParam(MaterialProduct, "material_id", [
      { model: Material, as: "material" },
    ]),
    validateConstructionBudgeProduct,
    body("material_id").optional().isInt(),
    body("amount").optional().isFloat(),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { material_product: material, product, construction, authUser } = req;

      // Solo los dueños de la construccion pueden editar los materiales de productos
      if (construction.create_by != authUser.id) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

      // Si el material no coincide con el producto
      if (material.product_id != product.id) {
        return res.status(404).json({
          value: req.params.material_id,
          msg: "el material_product no fue encontrado",
          param: "material_id",
          location: "params",
        });
      }

      await material.update(req.body);
      await material.save();

      res.status(200).json(material);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// DELETE MATERIAL
constructionBudgeProductMaterialRouter.delete(
  "/:construction_id/budge/:budge_id/product/:product_id/material/:material_id",
  [
    validateJWT,
    validateRoles(["admin"]),
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id"),
    existModelParam(Product, "product_id"),
    existModelParam(MaterialProduct, "material_id", [
      { model: Material, as: "material" },
    ]),
    validateConstructionBudgeProduct,
  ],
  async (req, res) => {
    try {
      const { material_product: material, product, construction, authUser } = req;

      // Solo los dueños de la construccion pueden editar los materiales de productos
      if (construction.create_by != authUser.id) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

      // Si el material no coincide con el producto
      if (material.product_id != product.id) {
        return res.status(404).json({
          value: req.params.material_id,
          msg: "el material_product no fue encontrado",
          param: "material_id",
          location: "params",
        });
      }

      await material.update({
        status: false,
      });

      await material.save();

      res.status(200).json(material);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

module.exports = constructionBudgeProductMaterialRouter;
