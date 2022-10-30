const express = require("express");
const constructionBudgeCategoryRouter = express.Router();

const { body } = require("express-validator");

const existModelParam = require("../middlewares/existModelParam");
const validateJWT = require("../middlewares/validateJWT");
const validateRoles = require("../middlewares/validateRoles");
const validateErrors = require("../middlewares/validateErrors");

const Construction = require("../models/Construction");
const Budge = require("../models/Budge");
const CategoryItem = require("../models/CategoryItem");

// CREAMOS CATEGORIA
constructionBudgeCategoryRouter.post(
  "/:construction_id/budge/:budge_id/category",
  [
    validateJWT,
    validateRoles(["admin"]),
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id"),
    body("name").exists().isString().isLength({ min: 3, max: 255 }),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { construction, budge, authUser } = req;
      const { name } = req.body;

      // Validamos si el presupuesto si le pertenece a esa construccion
      if (construction.id != budge.construction_id) {
        return res.status(404).json({
          value: req.params.budge_id,
          msg: "el budge no fue encontrado",
          param: "budge_id",
          location: "params",
        });
      }

      // Solo los dueños de la construccion pueden crear categorias
      if (construction.create_by != authUser.id) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

      // Creamos la categoria
      const category = await CategoryItem.create({
        name,
        budge_id: budge.id,
      });

      res.status(200).json(category);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// Obtenemos todas las categorias
constructionBudgeCategoryRouter.get(
  "/:construction_id/budge/:budge_id/category",
  [
    validateJWT,
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id"),
  ],
  async (req, res) => {
    try {
      const { construction, budge, authUser } = req;

      // Validamos si el presupuesto si le pertenece a esa construccion
      if (construction.id != budge.construction_id) {
        return res.status(404).json({
          value: req.params.budge_id,
          msg: "el budge no fue encontrado",
          param: "budge_id",
          location: "params",
        });
      }

      // Solo los dueños y clientes de la construccion pueden leer categorias
      if (
        construction.create_by != authUser.id &&
        construction.client_id != authUser.id
      ) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

      // Obtenemos las categorias
      const categories = await CategoryItem.findAll({
        where: {
          status: true,
          budge_id: budge.id,
        },
      });

      res.status(200).json(categories);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// obtenemos la categoria mediante un id
constructionBudgeCategoryRouter.get(
  "/:construction_id/budge/:budge_id/category/:category_id",
  [
    validateJWT,
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id"),
    existModelParam(CategoryItem, "category_id"),
  ],
  async (req, res) => {
    try {
      const { construction, budge, authUser, category_item: category } = req;

      // Validamos si el presupuesto si le pertenece a esa construccion
      if (construction.id != budge.construction_id) {
        return res.status(404).json({
          value: req.params.budge_id,
          msg: "el budge no fue encontrado",
          param: "budge_id",
          location: "params",
        });
      }

      // Solo los dueños y clientes de la construccion pueden leer categorias
      if (
        construction.create_by != authUser.id &&
        construction.client_id != authUser.id
      ) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

      // Validamos si el presupuesto si le pertenece a esa construccion
      if (budge.construction_id != category.budge_id) {
        return res.status(404).json({
          value: req.params.category_id,
          msg: "el category_item no fue encontrado",
          param: "category_id",
          location: "params",
        });
      }

      res.status(200).json(category);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// Editamos categoria
constructionBudgeCategoryRouter.put(
  "/:construction_id/budge/:budge_id/category/:category_id",
  [
    validateJWT,
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id"),
    existModelParam(CategoryItem, "category_id"),
    body("name").optional().isString().isLength({ min: 3, max: 255 }),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { construction, budge, authUser, category_item: category } = req;

      // Validamos si el presupuesto si le pertenece a esa construccion
      if (construction.id != budge.construction_id) {
        return res.status(404).json({
          value: req.params.budge_id,
          msg: "el budge no fue encontrado",
          param: "budge_id",
          location: "params",
        });
      }

      // Solo los dueños de la construccion pueden editar categorias
      if (construction.create_by != authUser.id) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

      // Validamos si el presupuesto si le pertenece a esa construccion
      if (budge.construction_id != category.budge_id) {
        return res.status(404).json({
          value: req.params.category_id,
          msg: "el category_item no fue encontrado",
          param: "category_id",
          location: "params",
        });
      }

      await category.update(req.body);
      await category.save();

      res.status(200).json(category);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);


// Eliminamos la categoria
constructionBudgeCategoryRouter.delete  (
  "/:construction_id/budge/:budge_id/category/:category_id",
  [
    validateJWT,
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id"),
    existModelParam(CategoryItem, "category_id")
  ],
  async (req, res) => {
    try {
      const { construction, budge, authUser, category_item: category } = req;

      // Validamos si el presupuesto si le pertenece a esa construccion
      if (construction.id != budge.construction_id) {
        return res.status(404).json({
          value: req.params.budge_id,
          msg: "el budge no fue encontrado",
          param: "budge_id",
          location: "params",
        });
      }

      // Solo los dueños de la construccion pueden editar categorias
      if (construction.create_by != authUser.id) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

      // Validamos si el presupuesto si le pertenece a esa construccion
      if (budge.construction_id != category.budge_id) {
        return res.status(404).json({
          value: req.params.category_id,
          msg: "el category_item no fue encontrado",
          param: "category_id",
          location: "params",
        });
      }

      await category.update({
        status: false
      });
      await category.save();

      res.status(200).json(category);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

module.exports = constructionBudgeCategoryRouter;
