const express = require("express");
const constructionBudgeMessageRouter = express.Router();

const { body } = require("express-validator");
const compareAuthUser = require("../middlewares/compareAuthUser");
const compareModels = require("../middlewares/compareModels");

const existModelParam = require("../middlewares/existModelParam");
const validateErrors = require("../middlewares/validateErrors");
const validateJWT = require("../middlewares/validateJWT");
const validateRoles = require("../middlewares/validateRoles");

const Budge = require("../models/Budge");
const BudgeMessage = require("../models/BudgeMessage");
const Construction = require("../models/Construction");

// CREATE BUDGE MESSAGE
constructionBudgeMessageRouter.post(
  "/:construction_id/budge/:budge_id/message",
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
    body("message").isString().isLength({ min: 3, max: 255 }),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { budge } = req;
      const { message } = req.body;

      // Creamos el mensaje de presupuesto
      const budgeMessage = await BudgeMessage.create({
        budge_id: budge.id,
        message,
      });

      res.status(200).json(budgeMessage);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// GET BUDGE MESSAGES
constructionBudgeMessageRouter.get(
  "/:construction_id/budge/:budge_id/message",
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

      // Obtenemos todos los mensajes del presupuesto
      const budgeMessages = await BudgeMessage.findAll({
        where: {
          status: true,
          budge_id: budge.id,
        },
      });

      res.status(200).json(budgeMessages);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// GET BUDGE MESSAGE
constructionBudgeMessageRouter.get(
  "/:construction_id/budge/:budge_id/message/:message_id",
  [
    validateJWT,
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id"),
    existModelParam(BudgeMessage, "message_id"),
    compareModels(
      { Model: Budge, key: "construction_id" },
      { Model: Construction, key: "id" }
    ),
    compareModels(
      { Model: BudgeMessage, key: "budge_id" },
      { Model: Budge, key: "id" }
    ),
    compareAuthUser(Construction, ["create_by", "client_id"]),
  ],
  async (req, res) => {
    try {
      const { budge_message: budgeMessage } = req;

      // Enviamos la respuesta
      res.status(200).json(budgeMessage);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// UPDATE BUDGE MESSAGE
constructionBudgeMessageRouter.put(
  "/:construction_id/budge/:budge_id/message/:message_id",
  [
    validateJWT,
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id"),
    existModelParam(BudgeMessage, "message_id"),
    compareModels(
      { Model: Budge, key: "construction_id" },
      { Model: Construction, key: "id" }
    ),
    compareModels(
      { Model: BudgeMessage, key: "budge_id" },
      { Model: Budge, key: "id" }
    ),
    compareAuthUser(Construction, ["create_by"]),
    body("message").optional().isLength({ min: 3, max: 255 }),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const {
        construction,
        budge,
        authUser,
        budge_message: budgeMessage,
      } = req;

      // Actualizamos el budgeMessage
      await budgeMessage.update(req.body);
      await budgeMessage.save();

      res.status(200).json(budgeMessage);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// DELETE BUDGE MESSAGE
constructionBudgeMessageRouter.delete(
  "/:construction_id/budge/:budge_id/message/:message_id",
  [
    validateJWT,
    existModelParam(Construction, "construction_id"),
    existModelParam(Budge, "budge_id"),
    existModelParam(BudgeMessage, "message_id"),
    compareModels(
      { Model: Budge, key: "construction_id" },
      { Model: Construction, key: "id" }
    ),
    compareModels(
      { Model: BudgeMessage, key: "budge_id" },
      { Model: Budge, key: "id" }
    ),
    compareAuthUser(Construction, ["create_by"]),
  ],
  async (req, res) => {
    try {
      const { budge_message: budgeMessage } = req;

      // Actualizamos el budgeMessage
      await budgeMessage.update({
        status: false,
      });
      await budgeMessage.save();

      res.status(200).json(budgeMessage);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);
module.exports = constructionBudgeMessageRouter;
