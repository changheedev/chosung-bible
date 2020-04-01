import { Sequelize, Op, WhereOptions } from 'sequelize';
import config from '../../config';
import fs = require('fs');
import path = require('path');

export { Sequelize, Op, WhereOptions };

interface SequelizeOptions {
  database: string;
  username: string;
  password: string;
  host: string;
  port: number;
}

class SequelizeDatabase {
  private client!: Sequelize;

  constructor() {}

  init(): Sequelize {
    if (!this.client) {
      const options = config.db.sequelize;
      this.client = this.connect(options);
      this.initModels(this.client);
    }
    return this.client;
  }

  private connect(options: SequelizeOptions): Sequelize {
    return new Sequelize(options.database, options.username, options.password, {
      host: options.host,
      port: options.port,
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
  }

  private initModels(sequelize: Sequelize): void {
    const curDir = path.join(__dirname, '/models');
    fs.readdirSync(curDir).map(file => {
      const init = require(path.join(curDir, file)).init;
      init(sequelize);
    });
  }

  async close(): Promise<void> {
    await this.client.close();
  }
}

export default new SequelizeDatabase();
