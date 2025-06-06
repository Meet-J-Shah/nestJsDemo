dotenv = require('dotenv');
dotenv.config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'test_db',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    seederStorage: 'json',
    seederStoragePath: 'sequelizeData.json',
    seederStorageTableName: 'sequelize_data',
    define: {
      underscored: true,
      timestamps: true,
      paranoid: true,
    },
  },
};
