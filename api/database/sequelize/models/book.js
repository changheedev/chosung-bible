import Sequelize from "sequelize";

export default class Book extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        // attributes
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true
        },
        name: {
          type: Sequelize.INTEGER
        }
      },
      {
        sequelize,
        modelName: "book",
        tableName: "tbl_book"
      }
    );
  }
}
