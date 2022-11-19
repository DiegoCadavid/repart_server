const configModel = {
  
};

const modelSync = async(model) => {
  try {
    await model.sync(configModel);
    console.log(` > ${model.name} sincronizado con la base de datos `.cyan);
  } catch (error) {
    console.log(` > error al sincronizar ${model.name} con la base de datos`.red);
    console.log(error)
  }
};

module.exports = { configModel, modelSync };