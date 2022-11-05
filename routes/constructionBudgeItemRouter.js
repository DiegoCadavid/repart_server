const express = require("express");
const constructionBudgeItemRouter = express.Router();
const { body } = require("express-validator");
const compareAuthUser = require("../middlewares/compareAuthUser");
const compareModels = require("../middlewares/compareModels");

const existModelParam = require("../middlewares/existModelParam");
const validateErrors = require("../middlewares/validateErrors");
const validateJWT = require("../middlewares/validateJWT");
const validateRoles = require("../middlewares/validateRoles");

const Budge = require("../models/Budge");
const CategoryItem = require("../models/CategoryItem");
const Construction = require("../models/Construction");
const Item = require("../models/Item");
const Product = require("../models/Product");

// CREATE ITEM
constructionBudgeItemRouter.post(
  "/:construction_id/budge/:budge_id/category/:category_id/item",
  [
    validateJWT,
    validateRoles(["admin"]),
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id"),
    existModelParam(CategoryItem, "category_id"),
    compareModels(
      { Model: Budge, key: "construction_id" },
      { Model: Construction, key: "id" }
    ),
    compareModels(
      { Model: CategoryItem, key: "budge_id" },
      { Model: Budge, key: "id" }
    ),
    compareAuthUser(Construction, ["create_by"]),
    body("amount").exists().isFloat(),
    body("product_id").exists().isInt(),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { budge, category_item: category } = req;
      const { amount, product_id } = req.body;

      // Verificamos si el producto existe
      const product = await Product.findOne({
        where: {
          id: product_id,
          budge_id: budge.id,
          status: true,
        },
      });

      if (!product) {
        return res.status(400).json({
          msg: "El producto no existe",
        });
      }

      // Creamos le producto
      const item = await Item.create({
        product_id: product.id,
        amount,
        budge_id: budge.id,
        category_id: category.id,
      });

      // Enviamos una respuesta
      res.status(200).json(item);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// OBTENEMOS TODOS LOS PRODUCTOS
constructionBudgeItemRouter.get(
  "/:construction_id/budge/:budge_id/item",
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

      // Buscamos el producto
      const items = await Item.findAll({
        where: {
          status: true,
          budge_id: budge.id,
        },
        include: [
          {
            model: CategoryItem,
            as: "category",
          },
          {
            model: Product,
            as: "product",
          },
        ],
      });

      // Enviamos una respuesta
      res.status(200).json(items);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// OBTENEMOS EL PRODUCTO POR EL ID
constructionBudgeItemRouter.get(
  "/:construction_id/budge/:budge_id/category/:category_id/item/:item_id",
  [
    validateJWT,
    validateRoles(["admin"]),
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id"),
    existModelParam(CategoryItem, "category_id"),
    existModelParam(Item, "item_id", [
      {
        model: Product,
        as: "product",
      },
    ]),
    compareModels(
      { Model: Budge, key: "construction_id" },
      { Model: Construction, key: "id" }
    ),
    compareModels(
      { Model: CategoryItem, key: "budge_id" },
      { Model: Budge, key: "id" }
    ),
    compareModels(
      { Model: Item, key: "category_id" },
      { Model: CategoryItem, key: "id" }
    ),
    compareAuthUser(Construction, ["create_by", "client_id"]),
  ],
  async (req, res) => {
    try {
      const { item } = req;

      // Enviamos una respuesta
      res.status(200).json(item);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// ACTUALIZAMOS EL PRODUCTO
constructionBudgeItemRouter.put(
  "/:construction_id/budge/:budge_id/category/:category_id/item/:item_id",
  [
    validateJWT,
    validateRoles(["admin"]),
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id"),
    existModelParam(CategoryItem, "category_id"),
    existModelParam(Item, "item_id", [
      {
        model: Product,
        as: "product",
      },
    ]),
    compareModels(
      { Model: Budge, key: "construction_id" },
      { Model: Construction, key: "id" }
    ),
    compareModels(
      { Model: CategoryItem, key: "budge_id" },
      { Model: Budge, key: "id" }
    ),
    compareModels(
      { Model: Item, key: "category_id" },
      { Model: CategoryItem, key: "id" }
    ),
    compareAuthUser(Construction, ["create_by"]),
    body("amount").optional().isFloat(),
    body("product_id").optional().isInt(),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { item } = req;

      await item.update(req.body);
      await item.save();

      // Enviamos una respuesta
      res.status(200).json(item);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// DELETE ITEM
constructionBudgeItemRouter.delete(
  "/:construction_id/budge/:budge_id/category/:category_id/item/:item_id",
  [
    validateJWT,
    validateRoles(["admin"]),
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id"),
    existModelParam(CategoryItem, "category_id"),
    existModelParam(Item, "item_id", [
      {
        model: Product,
        as: "product",
      },
    ]),
    compareModels(
      { Model: Budge, key: "construction_id" },
      { Model: Construction, key: "id" }
    ),
    compareModels(
      { Model: CategoryItem, key: "budge_id" },
      { Model: Budge, key: "id" }
    ),
    compareModels(
      { Model: Item, key: "category_id" },
      { Model: CategoryItem, key: "id" }
    ),
    compareAuthUser(Construction, ["create_by"]),
  ],
  async (req, res) => {
    try {
      const { item } = req;

      await item.update({
        status: false,
      });
      
      await item.save();
      // Enviamos una respuesta
      res.status(200).json(item);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

module.exports = constructionBudgeItemRouter;
