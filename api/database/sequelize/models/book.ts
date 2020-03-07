import { Model, DataTypes } from 'sequelize';
import sequelize from '../index';

class Book extends Model {
  id!: number;
  name!: string;
}

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
    modelName: 'book',
    tableName: 'tbl_book'
  }
);

export default Book;