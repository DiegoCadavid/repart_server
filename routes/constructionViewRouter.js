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
          let unit_cost = 0;

          rawMaterialsProducts.forEach((rawMaterialProduct) => {
            unit_cost +=
              rawMaterialProduct.material.cost * rawMaterialProduct.amount;
          });

          const unit_labor_cost = rawItem.product.labor_cost;

          // Le sumamos la mano de obra al costo por unidad del producto
          unit_cost += unit_labor_cost;

          // Le damos un formato a los valores
          const formatItem = {
            id: rawItem.id,
            name: rawItem.product.name,
            amount: rawItem.amount,
            unit_type: rawItem.product.unit_type,
            unit_cost,
            unit_labor_cost,
            total_cost: unit_cost * rawItem.amount,
            total_labor_cost: unit_labor_cost * rawItem.amount,
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
          totalLaborCostCategory += formatItem.total_labor_cost;
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

      res.status(200).json(elements);
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
            unit_type: rawMaterialProduct.material.unit_type,
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
        totalCostProduct += rawProduct.labor_cost;

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

constructionViewRouter.get(
  "/:construction_id/view/cost/budge/:budge_id",
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

      const items = await Item.findAll({
        where: {
          status: true,
          budge_id: budge.id,
        },
        include: [
          {
            model: Product,
            as: "product",
          },
        ],
      });

      let total_labor_cost = 0;
      let total_cost = 0;

      // Con el item product tenemos el valor de la mano ( por unidad del item )
      for (let i = 0; i < items.length; i++) {
        // Nesesitamos obtener el valor de cada item del presupuesto
        const item = items[i];

        // Obtenemos los materiales de ese producto
        const materialProducts = await MaterialProduct.findAll({
          where: {
            status: true,
            product_id: item.product.id,
          },
          include: [
            {
              model: Material,
              as: "material",
            },
          ],
        });

        // Obtenemos el valor del producto a base de todos los materiales
        let productCost = 0;

        // Le sumamos la mano de obra al costo del producto
        productCost += item.dataValues.product.labor_cost;
        total_labor_cost += item.dataValues.product.labor_cost * item.dataValues.amount;

        // Le sumamos al costo del producto el valor de sus materiales
        for (let j = 0; j < materialProducts.length; j++) {
          const materialProduct = materialProducts[j];
          const materialCost =
            materialProduct.dataValues.material.dataValues.cost;

          productCost += materialCost * materialProduct.dataValues.amount;
        }


        total_cost += productCost * item.dataValues.amount;
      }

      res.status(200).json({
        total_material_cost: total_cost - total_labor_cost,
        total_labor_cost,
        total_cost,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);
module.exports = constructionViewRouter;
