const express = require("express");
const materialRouter = express.Router();
const { body } = require("express-validator");
const existModelParam = require("../middlewares/existModelParam");
const existUniqueModelFields = require("../middlewares/existUniqueModelFields");
const validateErrors = require("../middlewares/validateErrors");

const validateJWT = require("../middlewares/validateJWT");
const validateRoles = require("../middlewares/validateRoles");

const Material = require("../models/Material");
const User = require("../models/User");

materialRouter.post(
  "/",
  [
    validateJWT,
    validateRoles(["admin"]),
    existUniqueModelFields(Material, ["name"]),
    body("name").exists().isLength({ min: 3, max: 255 }),
    body("cost").exists().isFloat(),
    body("unit_type").exists().isString(),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { authUser } = req;
      const { name, cost, unit_type } = req.body;

      // Creamos el material
      const material = await Material.create({
        name,
        cost: Number(cost),
        unit_type,
        create_by: authUser.id,
      });

      res.status(200).json(material);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// GET ALLS
materialRouter.get("/", async (req, res) => {
  try {
    const materials = await Material.findAll({
      where: {
        status: 1,
      },
      include: [
        {
          model: User,
          as: "creator",
        },
      ],
    });

    materials.forEach((material) => {
      delete material.dataValues.creator.dataValues.password;
    });

    res.status(200).json(materials);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      msg: "Contacte con el administrador",
    });
  }
});

// GET MATERIAL BY ID
materialRouter.get(
  "/:id",
  [
    existModelParam(Material, "id", [
      {
        model: User,
        as: "creator",
      },
    ]),
  ],
  (req, res) => {
    try {
      const { material } = req;
      delete material.dataValues.creator.dataValues.password;

      res.status(200).json(material);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

// UPDATE MATERIAL
materialRouter.put(
  "/:id",
  [
    validateJWT,
    validateRoles(["admin"]),
    existModelParam(Material, "id", [
      {
        model: User,
        as: "creator",
      },
    ]),
    body("name").optional().isLength({ min: 3, max: 255 }),
    body("cost").optional().isFloat(),
    body("unit_type").optional().isString(),
    validateErrors,
  ],
  async (req, res) => {
    try {
      const { material } = req;
      const { cost, ...materialValues } = req.body;

      await material.update({
        cost: Number(cost),
        ...materialValues,
      });
      material.save();
      delete material.dataValues.creator.dataValues.password;

      res.status(200).json(material);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

materialRouter.delete(
  "/:id",
  [
    validateJWT,
    validateRoles(["admin"]),
    existModelParam(Material, "id", [
      {
        model: User,
        as: "creator",
      },
    ]),
  ],
  async (req, res) => {
    try {
      const { material } = req;

      console.log(material);

      await material.update({
        status: false,
      });

      await material.save();

      delete material.dataValues.creator.dataValues.password;
      res.status(200).json(material);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Contacte con el administrador",
      });
    }
  }
);

module.exports = materialRouter;
