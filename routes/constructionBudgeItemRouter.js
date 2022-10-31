const express = require("express");
const constructionBudgeItemRouter = express.Router();
const { body } = require("express-validator");

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
    body("amount").exists().isFloat(),
    body("product_id").exists().isInt(),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { construction, budge, category_item: category, authUser } = req;
      const { amount, product_id } = req.body;

      // Validamos si el presupuesto si le pertenece a esa construccion
      if (construction.id != budge.construction_id) {
        return res.status(404).json({
          value: req.params.budge_id,
          msg: "el budge no fue encontrado",
          param: "budge_id",
          location: "params",
        });
      }

      // Solo los dueños de la construccion pueden crear elementos
      if (construction.create_by != authUser.id) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

      // Validamos si la categoria le pertgenece a ese presupuesto
      if (budge.id != category.budge_id) {
        console.log(category.budge_id)
        return res.status(404).json({
          value: req.params.category_id,
          msg: "el category_item no fue encontrado",
          param: "category_id",
          location: "params",
        });
      }

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
  ],
  async (req, res) => {
    try {
      const { construction, budge, category_item: category, authUser } = req;

      // Validamos si el presupuesto si le pertenece a esa construccion
      if (construction.id != budge.construction_id) {
        return res.status(404).json({
          value: req.params.budge_id,
          msg: "el budge no fue encontrado",
          param: "budge_id",
          location: "params",
        });
      }

      // Solo los dueños y clientes de la construccion pueden obtener elementos
      if (construction.create_by != authUser.id && construction.client_id != authUser.id) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

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
  ],
  async (req, res) => {
    try {
      const {
        construction,
        budge,
        category_item: category,
        authUser,
        item,
      } = req;

      // Validamos si el presupuesto si le pertenece a esa construccion
      if (construction.id != budge.construction_id) {
        return res.status(404).json({
          value: req.params.budge_id,
          msg: "el budge no fue encontrado",
          param: "budge_id",
          location: "params",
        });
      }

      // Solo los dueños y clientes de la construccion pueden obtener elementos
      if (construction.create_by != authUser.id && construction.client_id != authUser.id) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

      // Validamos si la categoria le pertgenece a ese presupuesto
      if (budge.construction_id != category.budge_id) {
        return res.status(404).json({
          value: req.params.category_id,
          msg: "el category_item no fue encontrado",
          param: "category_id",
          location: "params",
        });
      }

      // Validamos si el elemento pertenece a esa categoria
      if (item.category_id != category.id) {
        return res.status(404).json({
          value: req.params.item_id,
          msg: "el item no fue encontrado",
          param: "item_id",
          location: "params",
        });
      }

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
    body("amount").optional().isFloat(),
    body("product_id").optional().isInt(),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const {
        construction,
        budge,
        category_item: category,
        authUser,
        item,
      } = req;

      // Validamos si el presupuesto si le pertenece a esa construccion
      if (construction.id != budge.construction_id) {
        return res.status(404).json({
          value: req.params.budge_id,
          msg: "el budge no fue encontrado",
          param: "budge_id",
          location: "params",
        });
      }

      // Solo los dueños de la construccion pueden crear elementos
      if (construction.create_by != authUser.id) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

      // Validamos si la categoria le pertgenece a ese presupuesto
      if (budge.construction_id != category.budge_id) {
        return res.status(404).json({
          value: req.params.category_id,
          msg: "el category_item no fue encontrado",
          param: "category_id",
          location: "params",
        });
      }

      // Validamos si el elemento pertenece a esa categoria
      if (item.category_id != category.id) {
        return res.status(404).json({
          value: req.params.item_id,
          msg: "el item no fue encontrado",
          param: "item_id",
          location: "params",
        });
      }

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
    ])
  ],
  async (req, res) => {
    try {
      const {
        construction,
        budge,
        category_item: category,
        authUser,
        item,
      } = req;

      // Validamos si el presupuesto si le pertenece a esa construccion
      if (construction.id != budge.construction_id) {
        return res.status(404).json({
          value: req.params.budge_id,
          msg: "el budge no fue encontrado",
          param: "budge_id",
          location: "params",
        });
      }

      // Solo los dueños de la construccion pueden crear elementos
      if (construction.create_by != authUser.id) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

      // Validamos si la categoria le pertgenece a ese presupuesto
      if (budge.construction_id != category.budge_id) {
        return res.status(404).json({
          value: req.params.category_id,
          msg: "el category_item no fue encontrado",
          param: "category_id",
          location: "params",
        });
      }

      // Validamos si el elemento pertenece a esa categoria
      if (item.category_id != category.id) {
        return res.status(404).json({
          value: req.params.item_id,
          msg: "el item no fue encontrado",
          param: "item_id",
          location: "params",
        });
      }

      await item.update({
        status: false
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
