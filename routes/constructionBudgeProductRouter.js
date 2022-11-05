const express = require("express");
const constructionBudgeProductRouter = express.Router();
const { body } = require("express-validator");
const compareAuthUser = require("../middlewares/compareAuthUser");
const compareModels = require("../middlewares/compareModels");

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
    compareModels(
      { Model: Construction, key: "construction_id" },
      { Model: Construction, key: "id" }
    ),
    compareAuthUser(Construction, ["create_by"]),
    body("name").exists().isString().isLength({ min: 3, max: 255 }),
    body("labor_cost").exists().isFloat(),
    body("unit_type").exists().isString(),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { budge } = req;
      const { name, labor_cost, unit_type } = req.body;

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
    compareModels(
      { Model: Budge, key: "construction_id" },
      { Model: Construction, key: "id" }
    ),
    compareAuthUser(Construction, ["create_by", "client_id"]),
  ],
  async (req, res) => {
    try {
      const { budge } = req;

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
    validateConstructionBudgeProduct,
    compareAuthUser(Construction, ["create_by", "client_id"]),
  ],
  async (req, res) => {
    try {
      const { product } = req;

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
    compareAuthUser(Construction, ["create_by"]),
    body("name").optional().isString().isLength({ min: 3, max: 255 }),
    body("labor_cost").optional().isFloat(),
    body("unit_type").optional().isString(),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { product } = req;

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
    validateConstructionBudgeProduct,
    compareAuthUser(Construction, ["create_by"]),
  ],
  async (req, res) => {
    try {
      const { product } = req;

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
