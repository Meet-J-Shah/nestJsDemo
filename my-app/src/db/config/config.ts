import { SequelizeOptions } from 'sequelize-typescript';
import * as dotenv from 'dotenv';

dotenv.config();

const config: { [key: string]: SequelizeOptions } = {
  development: {
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: +process.env.DB_PORT! || 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'mydb_dev',
    // models: [__dirname + '/../models/*.model.ts'],
  },
  test: {
    dialect: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'password',
    database: 'mydb_test',
    // models: [__dirname + '/../models/*.model.ts'],
  },
  production: {
    dialect: 'mysql',
    host: 'prod-db-host',
    port: 3306,
    username: 'root',
    password: 'prod-password',
    database: 'mydb_prod',
    // models: [__dirname + '/../models/*.model.ts'],
  },
};

export default config;
