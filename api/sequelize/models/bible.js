const { Model, DataTypes } = require("sequelize");
const sequelize = require("..");

class Bible extends Model {}
Bible.init(
  {
    // attributes
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    book: {
      type: DataTypes.INTEGER
    },
    chapter: {
      type: DataTypes.INTEGER
    },
    verse: {
      type: DataTypes.INTEGER
    },
    content: {
      type: DataTypes.TEXT
    }
  },
  {
    sequelize,
    modelName: "bible",
    tableName: "tbl_bible",
    timestamps: false
  }
);

module.exports = Bible;
