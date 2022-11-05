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
const compareModels = require("../middlewares/compareModels");
const compareAuthUser = require("../middlewares/compareAuthUser");

// CREAMOS CATEGORIA
constructionBudgeCategoryRouter.post(
  "/:construction_id/budge/:budge_id/category",
  [
    validateJWT,
    validateRoles(["admin"]),
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id"),
    compareModels(
      { Model: Construction, key: "id" },
      { Model: Budge, key: "construction_id" }
    ),
    compareAuthUser(Construction, ["create_by"]),
    body("name").exists().isString().isLength({ min: 3, max: 255 }),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { budge } = req;
      const { name } = req.body;

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
    compareModels(
      { Model: Construction, key: "id" },
      { Model: Budge, key: "construction_id" }
    ),
    compareAuthUser(Construction, ["create_by", "client_id"]),
  ],
  async (req, res) => {
    try {
      const { budge } = req;

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
    compareModels(
      { Model: Construction, key: "id" },
      { Model: Budge, key: "construction_id" }
    ),
    compareModels(
      { Model: CategoryItem, key: "budge_id" },
      { Model: Budge, key: "id" }
    ),
    compareAuthUser(Construction, ["create_by", "client_id"]),
  ],
  async (req, res) => {
    try {
      const { category_item: category } = req;

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
    compareModels(
      { Model: Construction, key: "id" },
      { Model: Budge, key: "construction_id" }
    ),
    compareModels(
      { Model: CategoryItem, key: "budge_id" },
      { Model: Budge, key: "id" }
    ),
    compareAuthUser(Construction, ["create_by"]),
    body("name").optional().isString().isLength({ min: 3, max: 255 }),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { category_item: category } = req;

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
constructionBudgeCategoryRouter.delete(
  "/:construction_id/budge/:budge_id/category/:category_id",
  [
    validateJWT,
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id"),
    existModelParam(CategoryItem, "category_id"),
    compareModels(
      { Model: Construction, key: "id" },
      { Model: Budge, key: "construction_id" }
    ),
    compareModels(
      { Model: CategoryItem, key: "budge_id" },
      { Model: Budge, key: "id" }
    ),
    compareAuthUser(Construction, ["create_by"]),
  ],
  async (req, res) => {
    try {
      const { category_item: category } = req;

      await category.update({
        status: false,
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
