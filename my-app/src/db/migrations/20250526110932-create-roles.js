'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename columns if they exist
    await queryInterface
      .renameColumn('roles', 'createdAt', 'created_at')
      .catch(() => {});
    await queryInterface
      .renameColumn('roles', 'updatedAt', 'updated_at')
      .catch(() => {});

    // Add deleted_at column for soft deletes (paranoid)
    await queryInterface
      .addColumn('roles', 'deleted_at', {
        type: Sequelize.DATE,
        allowNull: true,
      })
      .catch(() => {});
  },

  async down(queryInterface) {
    // Revert column names
    await queryInterface
      .renameColumn('roles', 'created_at', 'createdAt')
      .catch(() => {});
    await queryInterface
      .renameColumn('roles', 'updated_at', 'updatedAt')
      .catch(() => {});

    // Remove deleted_at column
    await queryInterface.removeColumn('roles', 'deleted_at');
  },
};
