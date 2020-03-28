import { Model, Sequelize, DataTypes } from 'sequelize';

export default class Book extends Model {
  id!: number;
  name!: string;
  shortName!: string;
}

export function init(sequelize: Sequelize) {
  Book.init(
    {
      // attributes
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING
      },
      shortName: {
        field: 'short_name',
        type: DataTypes.STRING
      }
    },
    {
      sequelize,
      modelName: 'book',
      tableName: 'tbl_book'
    }
  );
}
