const Sequelize = require("sequelize");

//connect db
const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mariadb"
  }
);

//db con test
sequelize
  .authenticate()
  .then(() => {
    console.log("==============================================");
    console.log("Connection has been established successfully.");
    console.log("==============================================");
  })
  .catch(err => {
    console.log("==============================================");
    console.error("Unable to connect to the database:", err);
    console.log("==============================================");
  });

module.exports = sequelize;
