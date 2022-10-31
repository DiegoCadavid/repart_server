const express = require("express");
const existModelParam = require("../middlewares/existModelParam");
const validateJWT = require("../middlewares/validateJWT");
const Budge = require("../models/Budge");
const CategoryItem = require("../models/CategoryItem");
const Construction = require("../models/Construction");
const Item = require("../models/Item");
const Material = require("../models/Material");
const MaterialProduct = require("../models/MaterialProduct");
const Product = require("../models/Product");
const constructionViewRouter = express.Router();

constructionViewRouter.get(
  "/:construction_id/view/item/budge/:budge_id",
  [
    validateJWT,
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id"),
  ],
  async (req, res) => {
    try {
      const { authUser, construction, budge } = req;

      // Validamos si al usuario autenticado si le pertenece la construccion
      if (
        authUser.id != construction.client_id &&
        authUser.id != construction.create_by
      ) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

      // Validamos si la construccion coincide con la construccion del presupuesto
      if (construction.id != budge.construction_id) {
        return res.status(404).json({
          value: req.params.budge_id,
          msg: "el budge no fue encontrado",
          param: "budge_id",
          location: "params",
        });
      }

      // Obtenemos todas las categorias
      const categories = await CategoryItem.findAll({
        where: {
          status: true,
          budge_id: budge.id,
        },
      });

      // Array de todos los elementos
      let elements = [];

      // Obtenemos todos los items de la categoria
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];

        const rawItems = await Item.findAll({
          where: {
            status: true,
            category_id: category.id,
          },
          include: [
            {
              model: Product,
              as: "product",
            },
          ],
        });

        let formatItems = [];

        // Obtenemos los materiales del producto del item
        for (let j = 0; j < rawItems.length; j++) {
          const rawItem = rawItems[j];

          const rawMaterialsProducts = await MaterialProduct.findAll({
            where: {
              status: true,
              product_id: rawItem.product.id,
            },
            include: [
              {
                model: Material,
                as: "material",
              },
            ],
          });

          // Obtenemos el valor total del item
          let cost = 0;
          rawMaterialsProducts.forEach((rawMaterialProduct) => {
            cost +=
              rawMaterialProduct.material.cost * rawMaterialProduct.amount;
          });

          // Le damos un formato a los valores
          const formatItem = {
            id: rawItem.id,
            name: rawItem.product.name,
            amount: rawItem.amount,
            unit_type: rawItem.product.unit_type,
            cost,
            total_cost: cost * rawItem.amount,
            labor_cost: rawItem.product.labor_cost,
          };

          formatItems.push(formatItem);
        }

        let totalCostCategory = 0;
        let totalLaborCostCategory = 0;

        // Obtenemos el valor total de la categoria
        formatItems.forEach((formatItem) => {
          totalCostCategory += formatItem.total_cost;
        });

        formatItems.forEach((formatItem) => {
          totalLaborCostCategory += formatItem.labor_cost;
        });

        // Le damos formato a los elementos
        elements.push({
          id: category.id,
          category_name: category.name,
          total_cost: totalCostCategory,
          total_labor_cost: totalLaborCostCategory,
          items: formatItems,
        });
      }

      // Obtenemos el valor total del presupuesto
      let totalCostBudge = 0;
      let totalLaborCostBudge = 0;

      elements.forEach((element) => {
        totalCostBudge += element.total_cost;
        totalLaborCostBudge += element.total_labor_cost;
      });

      res.status(200).json({
        id: budge.id,
        name: budge.name,
        total_cost: totalCostBudge,
        total_labor_cost: totalLaborCostBudge,
        elements,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

constructionViewRouter.get(
  "/:construction_id/view/product/budge/:budge_id",
  [
    validateJWT,
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id"),
  ],
  async (req, res) => {
    try {
      const { authUser, construction, budge } = req;

      // Validamos si al usuario autenticado si le pertenece la construccion
      if (
        authUser.id != construction.client_id &&
        authUser.id != construction.create_by
      ) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

      // Validamos si la construccion coincide con la construccion del presupuesto
      if (construction.id != budge.construction_id) {
        return res.status(404).json({
          value: req.params.budge_id,
          msg: "el budge no fue encontrado",
          param: "budge_id",
          location: "params",
        });
      }

      const rawProducts = await Product.findAll({
        where: {
          status: true,
          budge_id: budge.id,
        },
      });

      let formatProducts = [];

      for (let i = 0; i < rawProducts.length; i++) {
        const rawProduct = rawProducts[i];

        const rawMaterialsProducts = await MaterialProduct.findAll({
          where: {
            status: 1,
            product_id: rawProduct.id,
          },
          include: [
            {
              model: Material,
              as: "material",
            },
          ],
        });

        let formatMaterialsProducts = [];

        rawMaterialsProducts.forEach((rawMaterialProduct) => {
          formatMaterialsProducts.push({
            id: rawMaterialProduct.id,
            name: rawMaterialProduct.material.name,
            amount: rawMaterialProduct.amount,
            cost: rawMaterialProduct.material.cost,
            total_cost:
              rawMaterialProduct.material.cost * rawMaterialProduct.amount,
          });
        });

        let totalCostProduct = 0;

        formatMaterialsProducts.forEach((formatMaterialsProduct) => {
          totalCostProduct += formatMaterialsProduct.total_cost;
        });

        formatProducts.push({
          id: rawProduct.id,
          product: rawProduct.name,
          total_cost: totalCostProduct,
          labor_cost: rawProduct.labor_cost,
          materials: formatMaterialsProducts,
        });
      }

      res.status(200).json(formatProducts);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);
module.exports = constructionViewRouter;
