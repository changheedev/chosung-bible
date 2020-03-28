import { Model, Sequelize, DataTypes } from 'sequelize';

export default class Bible extends Model {
  id!: number;
  book!: number;
  chpater!: number;
  verse!: number;
  content!: string;
}

export function init(sequelize: Sequelize) {
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
      modelName: 'bible',
      tableName: 'tbl_bible'
    }
  );
}
