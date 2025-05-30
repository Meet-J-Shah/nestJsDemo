'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    const permissions = [
      // Role Permissions
      {
        name: 'create_role',
        display_name: 'Create Role',
        description: 'Allows creating new roles',
        created_at: now,
        updated_at: now,
      },
      {
        name: 'read_role',
        display_name: 'Read Role',
        description: 'Allows viewing roles',
        created_at: now,
        updated_at: now,
      },
      {
        name: 'update_role',
        display_name: 'Update Role',
        description: 'Allows updating existing roles',
        created_at: now,
        updated_at: now,
      },
      {
        name: 'delete_role',
        display_name: 'Delete Role',
        description: 'Allows deleting roles',
        created_at: now,
        updated_at: now,
      },

      // User Permissions
      {
        name: 'create_user',
        display_name: 'Create User',
        description: 'Allows creating new users',
        created_at: now,
        updated_at: now,
      },
      {
        name: 'read_user',
        display_name: 'Read User',
        description: 'Allows viewing users',
        created_at: now,
        updated_at: now,
      },
      {
        name: 'update_user',
        display_name: 'Update User',
        description: 'Allows updating user information',
        created_at: now,
        updated_at: now,
      },
      {
        name: 'delete_user',
        display_name: 'Delete User',
        description: 'Allows deleting users',
        created_at: now,
        updated_at: now,
      },

      // Book Permissions
      {
        name: 'create_book',
        display_name: 'Create Book',
        description: 'Allows adding new books',
        created_at: now,
        updated_at: now,
      },
      {
        name: 'read_book',
        display_name: 'Read Book',
        description: 'Allows viewing books',
        created_at: now,
        updated_at: now,
      },
      {
        name: 'update_book',
        display_name: 'Update Book',
        description: 'Allows updating book information',
        created_at: now,
        updated_at: now,
      },
      {
        name: 'delete_book',
        display_name: 'Delete Book',
        description: 'Allows deleting books',
        created_at: now,
        updated_at: now,
      },
    ];

    await queryInterface.bulkInsert('permissions', permissions, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('permissions', null, {});
  },
};
