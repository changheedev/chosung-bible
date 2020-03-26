import { Model } from 'sequelize';

class Bible extends Model {
  id!: number;
  book!: number;
  chpater!: number;
  verse!: number;
  content!: string;
}
export default Bible;
