const express = require("express");
const constructionBudgeProductRouter = express.Router();
const { body } = require("express-validator");

const existModelParam = require("../middlewares/existModelParam");
const validateConstructionBudgeProduct = require("../middlewares/validateConstructionBudgeProduct");
const validateErrors = require("../middlewares/validateErrors");
const validateJWT = require("../middlewares/validateJWT");
const validateRoles = require("../middlewares/validateRoles");

const Budge = require("../models/Budge");
const Construction = require("../models/Construction");
const Product = require("../models/Product");

// CREATE PRODUCT
constructionBudgeProductRouter.post(
  "/:construction_id/budge/:budge_id/product",
  [
    validateJWT,
    validateRoles(["admin"]),
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id"),
    body("name").exists().isString().isLength({ min: 3, max: 255 }),
    body("labor_cost").exists().isFloat(),
    body("unit_type").exists().isString(),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { construction, budge, authUser } = req;
      const { name, labor_cost, unit_type } = req.body;

      // Validamos si el presupuesto si le pertenece a esa construccion
      if (construction.id != budge.construction_id) {
        return res.status(404).json({
          value: req.params.budge_id,
          msg: "el budge no fue encontrado",
          param: "budge_id",
          location: "params",
        });
      }

      // Solo los dueños de la construccion pueden crear products
      if (construction.create_by != authUser.id) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

      // Creamos el producto en la base de datos
      const product = await Product.create({
        name,
        budge_id: budge.id,
        labor_cost,
        unit_type,
      });

      res.status(200).json(product);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// GET PRODUCTS
constructionBudgeProductRouter.get(
  "/:construction_id/budge/:budge_id/product",
  [
    validateJWT,
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id"),
  ],
  async (req, res) => {
    try {
      const { construction, budge, authUser } = req;

      // Validamos si ese presupuesto si le pertence a esa construccion
      if (construction.id != budge.construction_id) {
        return res.status(404).json({
          value: req.params.budge_id,
          msg: "el budge no fue encontrado",
          param: "budge_id",
          location: "params",
        });
      }

      // Solo los dueños y los cliente de la construccion pueden obtener los products
      if (construction.create_by != authUser.id && construction.client_id != authUser.id) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

      // Obtenemos todos los productos
      const products = await Product.findAll({
        where: { status: 1, budge_id: budge.id },
      });

      // Enviamos todos los productos
      res.status(200).json(products);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// GET PRODUCT
constructionBudgeProductRouter.get(
  "/:construction_id/budge/:budge_id/product/:product_id",
  [
    validateJWT,
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id"),
    existModelParam(Product, "product_id"),
    validateConstructionBudgeProduct
  ],
  async (req, res) => {
    try {
      const { construction, authUser,  product } = req;

      // Solo los dueños o los clientes de la construccion pueden obtener los productos
      if (construction.create_by != authUser.id && construction.client_id != authUser.id) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

      // Enviamos el producto
      res.status(200).json(product);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// UPDATE PRODUCT
constructionBudgeProductRouter.put(
  "/:construction_id/budge/:budge_id/product/:product_id",
  [
    validateJWT,
    validateRoles(["admin"]),
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id"),
    existModelParam(Product, "product_id"),
    validateConstructionBudgeProduct,
    body("name").optional().isString().isLength({ min: 3, max: 255 }),
    body("labor_cost").optional().isFloat(),
    body("unit_type").optional().isString(),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { product, construction, authUser } = req;

  // Solo los dueños o los clientes de la construccion pueden obtener el presupuesto
  if (construction.create_by != authUser.id && construction.client_id != authUser.id) {
    return res.status(403).json({
      msg: "No permitido",
    });
  }

      // Creamos el producto en la base de datos
      await product.update(req.body);
      await product.save();

      res.status(200).json(product);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// DELETE PRODUCT
constructionBudgeProductRouter.delete(
  "/:construction_id/budge/:budge_id/product/:product_id",
  [
    validateJWT,
    validateRoles(["admin"]),
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id"),
    existModelParam(Product, "product_id"),
    validateConstructionBudgeProduct
  ],
  async (req, res) => {
    try {
      const { authUser, construction,  product } = req;

      // Solo los dueños de la construccion pueden editar el presupuesto
      if ( construction.create_by != authUser.id  ) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

      // Elimiamos el producto
      await product.update({
        status: false,
      });
      await product.save();

      res.status(200).json(product);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

module.exports = constructionBudgeProductRouter;
