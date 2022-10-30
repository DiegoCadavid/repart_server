const express = require("express");

// MIDDLEWARES
const cors = require("cors");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");

const db = require("./database/connection");
const cloudinary = require("cloudinary").v2;

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;

    this.middlewares();
    this.connectDB();
    this.connectCloudinary();
    this.routes();
  }

  routes() {
    this.app.use("/auth", require("./routes/authRouter"));
    this.app.use("/user", require("./routes/userRouter"));

    this.app.use('/material', require('./routes/materialRouter'));

    this.app.use("/construction", require("./routes/constructionRouter"));
    this.app.use("/construction", require("./routes/constructionImageRouter"));
    this.app.use("/construction", require("./routes/constructionBudgeRouter"));
    this.app.use("/construction", require("./routes/constructionBudgeProductRouter"));
    this.app.use("/construction", require("./routes/constructionBudgeProductMaterialRouter"));
  }

  async connectDB() {
    try {
      await db.authenticate();
      console.log("Base de datos conectada");
    } catch (error) {
      throw new Error(error);
    }
  }

  connectCloudinary() {
    try {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD,
        api_key: process.env.CLOUDINARY_API,
        api_secret: process.env.CLOUDINARY_SECRET,
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  middlewares() {
    this.app.use(cors());
    this.app.use(morgan("dev"));
    this.app.use(express.json());
    this.app.use(fileUpload());
  }

  init() {
    this.app.listen(this.port, () => {
      console.log(`\nServidor corriendo el puerto ${this.port}`);
    });
  }
}

module.exports = Server;
