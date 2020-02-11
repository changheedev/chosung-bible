import Sequelize from "sequelize";

export default class Bible extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        // attributes
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true
        },
        book: {
          type: Sequelize.INTEGER
        },
        chapter: {
          type: Sequelize.INTEGER
        },
        verse: {
          type: Sequelize.INTEGER
        },
        content: {
          type: Sequelize.TEXT
        }
      },
      {
        sequelize,
        modelName: "bible",
        tableName: "tbl_bible"
      }
    );
  }
}
