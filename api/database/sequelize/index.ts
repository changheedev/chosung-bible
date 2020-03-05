import { Sequelize } from 'sequelize';

class Database {
  private static instance: Database;
  private _sequelize!: Sequelize;

  private constructor() {
    if (
      !process.env.DB_DATABASE ||
      !process.env.DB_USERNAME ||
      !process.env.DB_PASSWORD ||
      !process.env.DB_HOST ||
      !process.env.DB_PORT
    )
      throw new Error('Not exist sequelize options');

    //connect db
    if (!Database.instance) {
      this._sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
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

      Database.instance = this;
    }

    return Database.instance;
  }

  testConnect() {
    //db con test
    this._sequelize
      .authenticate()
      .then(() => {
        console.log('==============================================');
        console.log('MariaDB connection by sequelize successful');
        console.log('==============================================');
      })
      .catch(err => {
        console.log('==============================================');
        console.log('Unable to connect to the database:');
        console.log('==============================================');
      });
  }

  static getInstance() {
    return new Database();
  }

  get sequelize() {
    return this._sequelize;
  }
}

const database = Database.getInstance();
database.testConnect();

export default database.sequelize;
