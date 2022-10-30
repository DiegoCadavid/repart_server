/**
 * Realiza multiples validaciones para validar si el presupuesto si es dicha construccion,
 * si es el dueño de la construccion y si el producto si le corresponde a ese presupuesto
 */
const validateConstructionBudgeProduct = (req, res, next) => {
  try {
    const { construction, budge, product, authUser } = req;

    if (!(construction && budge && product && authUser)) {
      return res.status(500).json({
        msg: "Se debe validar la existencia de construction, budge, product en los params",
      });
    }

    // Validamos si el presupuesto si es de esa construccion
    if (construction.id != budge.construction_id) {
      return res.status(404).json({
        value: req.params.budge_id,
        msg: "el budge no fue encontrado",
        param: "budge_id",
        location: "params",
      });
    }

    // Solo los dueños de la construccion pueden obtener el producto
    if (construction.create_by != authUser.id) {
      return res.status(403).json({
        msg: "No permitido",
      });
    }

    // Verificamos si el producto si le corresponde a ese presupuesto
    if (product.budge_id != budge.id) {
      return res.status(404).json({
        value: req.params.budge_id,
        msg: "el product no fue encontrado",
        param: "product_id",
        location: "params",
      });
    }

    next();
  } catch (error) {
    console.log(error);

    res.status(500).json({
      msg: "Contacte con el administrador",
    });
  }
};

module.exports = validateConstructionBudgeProduct;
