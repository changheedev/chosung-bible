import { Model } from 'sequelize';

export default class Book extends Model {
  id!: number;
  name!: string;
}
