const express = require("express");
const constructionBudgeMessageRouter = express.Router();

const { body } = require("express-validator");

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
    body("message").isString().isLength({ min: 3, max: 255 }),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { construction, budge, authUser } = req;
      const { message } = req.body;

      // Validamos si el presupuesto si le pertenece a esa construccion
      if (construction.id != budge.construction_id) {
        return res.status(404).json({
          value: req.params.budge_id,
          msg: "el budge no fue encontrado",
          param: "budge_id",
          location: "params",
        });
      }

      // Solo los dueños de la construccion pueden crear products
      if (construction.create_by != authUser.id) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

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

      // Solo los dueños de la construccion pueden crear products
      if (
        construction.create_by != authUser.id &&
        construction.client_id != authUser.id
      ) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

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
  ],
  async (req, res) => {
    try {
      const {
        construction,
        budge,
        authUser,
        budge_message: budgeMessage,
      } = req;

      // validamos si el presupuesto pertenece a la construccion
      if (construction.id != budge.construction_id) {
        return res.status(404).json({
          value: req.params.budge_id,
          msg: "el budge no fue encontrado",
          param: "budge_id",
          location: "params",
        });
      }

      // Validamos si el mensaje  pertenece a ese presupuesto
      if (budge.construction_id != budgeMessage.budge_id) {
        return res.status(404).json({
          value: req.params.message_id,
          msg: "el budge_message no fue encontrado",
          param: "message_id",
          location: "params",
        });
      }

      // Solo los dueños o los clientes de la construccion pueden leer los mensajes
      if (
        construction.create_by != authUser.id &&
        construction.client_id != authUser.id
      ) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

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

      // validamos si el presupuesto pertenece a la construccion
      if (construction.id != budge.construction_id) {
        return res.status(404).json({
          value: req.params.budge_id,
          msg: "el budge no fue encontrado",
          param: "budge_id",
          location: "params",
        });
      }

      // Validamos si el mensaje  pertenece a ese presupuesto
      if (budge.construction_id != budgeMessage.budge_id) {
        return res.status(404).json({
          value: req.params.message_id,
          msg: "el budge_message no fue encontrado",
          param: "message_id",
          location: "params",
        });
      }

      // Solo los dueños o los clientes de la construccion pueden editar los mensajes
      if (
        construction.create_by != authUser.id &&
        construction.client_id != authUser.id
      ) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

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
    existModelParam(BudgeMessage, "message_id")
  ],
  async (req, res) => {
    try {
      const {
        construction,
        budge,
        authUser,
        budge_message: budgeMessage,
      } = req;

      // validamos si el presupuesto pertenece a la construccion
      if (construction.id != budge.construction_id) {
        return res.status(404).json({
          value: req.params.budge_id,
          msg: "el budge no fue encontrado",
          param: "budge_id",
          location: "params",
        });
      }

      // Validamos si el mensaje  pertenece a ese presupuesto
      if (budge.construction_id != budgeMessage.budge_id) {
        return res.status(404).json({
          value: req.params.message_id,
          msg: "el budge_message no fue encontrado",
          param: "message_id",
          location: "params",
        });
      }

      // Solo los dueños o los clientes de la construccion pueden editar los mensajes
      if (
        construction.create_by != authUser.id &&
        construction.client_id != authUser.id
      ) {
        return res.status(403).json({
          msg: "No permitido",
        });
      }

      // Actualizamos el budgeMessage
      await budgeMessage.update({
        status : false
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
