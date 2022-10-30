const express = require("express");
const constructionBudgeRouter = express.Router();
const { body } = require("express-validator");

const existModelParam = require("../middlewares/existModelParam");
const validateErrors = require("../middlewares/validateErrors");
const validateJWT = require("../middlewares/validateJWT");
const validateRoles = require("../middlewares/validateRoles");

const Budge = require("../models/Budge");
const Construction = require("../models/Construction");

// CREATE BUDGE
constructionBudgeRouter.post(
  "/:construction_id/budge",
  [
    validateJWT,
    validateRoles(["admin"]),
    existModelParam(Construction, "construction_id"),
    body("name").exists().isString().isLength({ min: 3, max: 255 }),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { construction, authUser } = req;
      const { name } = req.body;

      // Solo los dueños de la construccion pueden crear presupuestos
      if (construction.create_by != authUser.id) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

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
  [validateJWT, existModelParam(Construction, "construction_id")],
  async (req, res) => {
    try {
      const { construction, authUser } = req;

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

      // Solo los dueños de la construccion pueden ver los presupuestos
      if (construction.create_by != authUser.id) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

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
  ],
  async (req, res) => {
    try {
      const { construction, budge, authUser } = req;

      if (construction.id != budge.construction_id) {
        return res.status(404).json({
          value: req.params.budge_id,
          msg: "el budge no fue encontrado",
          param: "budge_id",
          location: "params",
        });
      }

        // Solo los dueños de la construccion pueden editar su presupuesto
        if (construction.create_by != authUser.id) {
          return res.status(403).json({
            msg: "No permitido",
          });
        }

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
    body("name").optional().isString().isLength({ min: 3, max: 255 }),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { construction, budge, authUser } = req;

      if (construction.id != budge.construction_id) {
        return res.status(404).json({
          value: req.params.budge_id,
          msg: "el budge no fue encontrado",
          param: "budge_id",
          location: "params",
        });
      }

      // Solo los dueños de la construccion pueden editar su presupuesto
      if (construction.create_by != authUser.id) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

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
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { construction, budge, authUser } = req;

      if (construction.id != budge.construction_id) {
        return res.status(404).json({
          value: req.params.budge_id,
          msg: "el budge no fue encontrado",
          param: "budge_id",
          location: "params",
        });
      }

      // Solo los dueños de la construccion pueden eliminar presupuestos
      if (construction.create_by != authUser.id) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

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
