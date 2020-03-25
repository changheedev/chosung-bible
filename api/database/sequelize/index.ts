import { Sequelize, DataTypes, Op, WhereOptions } from 'sequelize';
import Book from './models/Book';
import Bible from './models/Bible';
import config from '../../config';

export { Sequelize, Op, WhereOptions };

export default class SequelizeDatabase {
  private static instance: SequelizeDatabase;
  private _sequelize!: Sequelize;

  constructor() {
    //connect db
    if (!SequelizeDatabase.instance) {
      const configs = config.db.sequelize;

      const sequelize = new Sequelize(configs.database, configs.username, configs.password, {
        host: configs.host,
        port: configs.port,
        dialect: 'mariadb',
        dialectOptions: {
          ssl: false,
          charset: 'utf8mb4',
          collate: 'utf8mb4_unicode_ci',
          timezone: 'Asia/Seoul'
        },
        define: {
          timestamps: false
        }
      });

      sequelize
        .authenticate()
        .then(() => {
          console.log('==============================================');
          console.log('MariaDB connection by sequelize successful');
          console.log('==============================================');
        })
        .catch(err => {
          console.log('==============================================');
          console.log('Unable to connect to the database:', err);
          console.log('==============================================');
        });

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

      this._sequelize = sequelize;
      SequelizeDatabase.instance = this;
    }

    return SequelizeDatabase.instance;
  }

  disconnect(): Promise<void> {
    return this._sequelize.close();
  }

  get database() {
    return this._sequelize;
  }
}
