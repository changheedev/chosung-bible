import { Model, DataTypes } from 'sequelize';
import sequelize from '../index';

class Bible extends Model {
  id!: number;
  book!: number;
  chpater!: number;
  verse!: number;
  content!: string;
}

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

export default Bible;
