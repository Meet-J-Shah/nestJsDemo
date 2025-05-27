'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const permissions = [
      // Role Permissions
      { name: 'create_role', created_at: new Date(), updated_at: new Date() },
      { name: 'read_role', created_at: new Date(), updated_at: new Date() },
      { name: 'update_role', created_at: new Date(), updated_at: new Date() },
      { name: 'delete_role', created_at: new Date(), updated_at: new Date() },

      // User Permissions
      { name: 'create_user', created_at: new Date(), updated_at: new Date() },
      { name: 'read_user', created_at: new Date(), updated_at: new Date() },
      { name: 'update_user', created_at: new Date(), updated_at: new Date() },
      { name: 'delete_user', created_at: new Date(), updated_at: new Date() },

      // Book Permissions
      { name: 'create_book', created_at: new Date(), updated_at: new Date() },
      { name: 'read_book', created_at: new Date(), updated_at: new Date() },
      { name: 'update_book', created_at: new Date(), updated_at: new Date() },
      { name: 'delete_book', created_at: new Date(), updated_at: new Date() },
    ];

    await queryInterface.bulkInsert('permissions', permissions, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('permissions', null, {});
  },
};
