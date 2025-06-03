'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add authorId column
    await queryInterface.addColumn('books', 'author_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // or 'CASCADE'
    });

    // These may already exist, add conditionally if needed
    await Promise.all([
      queryInterface.removeColumn('books', 'email'),
      queryInterface.removeColumn('books', 'password'),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('books', 'author_id'),
      queryInterface.addColumn('books', 'email', {
        type: Sequelize.STRING,
        allowNull: false,
      }),
      queryInterface.addColumn('books', 'password', {
        type: Sequelize.STRING,
        allowNull: false,
      }),
    ]);
  },
};
