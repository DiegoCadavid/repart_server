const express = require("express");
const compareAuthUser = require("../middlewares/compareAuthUser");
const compareModels = require("../middlewares/compareModels");
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
    compareModels(
      { Model: Budge, key: "construction_id" },
      { Model: Construction, key: "id" }
    ),
    compareAuthUser(Construction, ["client_id", "create_by"]),
  ],
  async (req, res) => {
    try {
      const { budge } = req;

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

        // Obtenemos todos los items de la categoria
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

        // items formateados de la categoria
        let formatItems = [];

        // Obtenemos los materiales de los productos del item
        for (let j = 0; j < rawItems.length; j++) {
          const rawItem = rawItems[j];

          // Obtenemos todos los materiales del producto
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

          // Obtenemos el valor total del item a base del costo de los productos
          let cost = 0;

          rawMaterialsProducts.forEach((rawMaterialProduct) => {
            cost +=
              rawMaterialProduct.material.cost * rawMaterialProduct.amount;
          });

          // Le agregamos el valor de la mano de obra
          cost += rawItem.product.labor_cost;

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


        // Calculamos el valor del la categoria
        let totalCostCategory = 0;
        let totalLaborCostCategory = 0;

        // Obtenemos el valor total de la categoria
        formatItems.forEach((formatItem) => {
          // El valor de total de la categoria ya contiene la mano de obra porque la sumamos anteriormente en cada item
          totalCostCategory += formatItem.total_cost;
        });

        formatItems.forEach((formatItem) => {
          totalLaborCostCategory += formatItem.labor_cost;
        });

        // Le damos formato a los elementos y los guardamos
        elements.push({
          id: category.id,
          category_name: category.name,
          total_cost: totalCostCategory,
          total_labor_cost: totalLaborCostCategory,
          items: formatItems,
        });
      }

      res.status(200).json({
        id: budge.id,
        name: budge.name,
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
    compareModels(
      { Model: Budge, key: "construction_id" },
      { Model: Construction, key: "id" }
    ),
    compareAuthUser(Construction, ["create_by", "client_id"]),
  ],
  async (req, res) => {
    try {
      const { budge } = req;

      // Obtenemos todos los productos del presupuesto
      const rawProducts = await Product.findAll({
        where: {
          status: true,
          budge_id: budge.id,
        },
      });

      let formatProducts = [];

      // Obtenemos todos los materiales del productos
      for (let i = 0; i < rawProducts.length; i++) {
        const rawProduct = rawProducts[i];

        // Obtenemos todos los materiales del producto "n => n"
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

        // le damos formato y guardamos todos los los materiales del producto 
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

        // Obtenemos el valor total del producto
        let totalCostProduct = 0;

        formatMaterialsProducts.forEach((formatMaterialsProduct) => {
          totalCostProduct += formatMaterialsProduct.total_cost;
        });

        // Le sumamos al valor total el valor de la mano de obra
        totalCostProduct += rawProduct.labor_cost

        formatProducts.push({
          id: rawProduct.id,
          product: rawProduct.name,
          unit_type: rawProduct.unit_type,
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
