const { Model, DataTypes } = require("sequelize");
const sequelize = require("..");

class Book extends Model {}
Book.init(
  {
    // attributes
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING
    }
  },
  {
    sequelize,
    modelName: "book",
    tableName: "tbl_book",
    timestamps: false
  }
);

module.exports = Book;
