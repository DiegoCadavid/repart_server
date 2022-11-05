const express = require("express");
const constructionBudgeRouter = express.Router();
const { body } = require("express-validator");

const existModelParam = require("../middlewares/existModelParam");
const validateErrors = require("../middlewares/validateErrors");
const validateJWT = require("../middlewares/validateJWT");
const validateRoles = require("../middlewares/validateRoles");
const compareModels = require("../middlewares/compareModels");
const compareAuthUser = require("../middlewares/compareAuthUser");

const Budge = require("../models/Budge");
const Construction = require("../models/Construction");

// CREATE BUDGE
constructionBudgeRouter.post(
  "/:construction_id/budge",
  [
    validateJWT,
    validateRoles(["admin"]),
    existModelParam(Construction, "construction_id"),
    compareAuthUser(Construction, ["create_by"]),
    body("name").exists().isString().isLength({ min: 3, max: 255 }),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { construction } = req;
      const { name } = req.body;

      const budge = await Budge.create({
        name,
        construction_id: construction.id,
      });

      res.status(200).json(budge);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// GET BUDGES
constructionBudgeRouter.get(
  "/:construction_id/budge",
  [
    validateJWT,
    existModelParam(Construction, "construction_id"),
    compareAuthUser(Construction, ["create_by", "client_id"]),
  ],
  async (req, res) => {
    try {
      const { construction } = req;

      const budges = await Budge.findAll({
        where: {
          status: true,
          construction_id: construction.id,
        },
        include: [
          {
            model: Construction,
            as: "construction",
          },
        ],
      });

      res.status(200).json(budges);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// GET BUDGE
constructionBudgeRouter.get(
  "/:construction_id/budge/:budge_id",
  [
    validateJWT,
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id", [
      { model: Construction, as: "construction" },
    ]),
    compareModels(
      { Model: Budge, key: "construction_id" },
      { Model: Construction, key: "id" }
    ),
    compareAuthUser(Construction, ["create_by", "client_id"]),
  ],
  async (req, res) => {
    try {
      const { budge } = req;

      res.status(200).json(budge);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// EDIT BUDGE
constructionBudgeRouter.put(
  "/:construction_id/budge/:budge_id",
  [
    validateJWT,
    validateRoles(["admin"]),
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id", [
      { model: Construction, as: "construction" },
    ]),
    compareModels(
      { Model: Budge, key: "construction_id" },
      { Model: Construction, key: "id" }
    ),
    compareAuthUser(Construction, ["create_by"]),
    body("name").optional().isString().isLength({ min: 3, max: 255 }),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { budge } = req;

      await budge.update(req.body);
      await budge.save();

      res.status(200).json(budge);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// DELETE BUDGE
constructionBudgeRouter.delete(
  "/:construction_id/budge/:budge_id",
  [
    validateJWT,
    validateRoles(["admin"]),
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id"),
    compareModels(
      { Model: Budge, key: "construction_id" },
      { Model: Construction, key: "id" }
    ),
    compareAuthUser(Construction, ["create_by"]),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { budge } = req;

      await budge.update({
        status: false,
      });
      await budge.save();

      res.status(200).json(budge);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

module.exports = constructionBudgeRouter;
