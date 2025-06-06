'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get Super Admin role ID
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE name = 'SuperAdmin' AND deleted_at IS NULL LIMIT 1;`,
    );

    if (!roles.length) {
      throw new Error('Super Admin role not found');
    }

    const superAdminRoleId = roles[0].id;
    await queryInterface.bulkDelete('role_permissions', {
      role_id: superAdminRoleId,
    });
    // Get all permissions
    const [permissions] = await queryInterface.sequelize.query(
      `SELECT id FROM permissions;`,
    );

    if (!permissions.length) {
      throw new Error('No permissions found');
    }

    // Build role-permission mappings
    const rolePermissions = permissions.map((permission) => ({
      role_id: superAdminRoleId,
      permission_id: permission.id,
    }));
    await queryInterface.bulkInsert('role_permissions', rolePermissions, {
      ignoreDuplicates: true, // only works in MySQL/MariaDB
    });
  },

  async down(queryInterface, Sequelize) {
    // Get Super Admin role ID
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE name = 'Super Admin' AND deleted_at IS NULL LIMIT 1;`,
    );

    if (!roles.length) return;

    const superAdminRoleId = roles[0].id;

    // Delete entries for Super Admin
    await queryInterface.bulkDelete('role_permissions', {
      role_id: superAdminRoleId,
    });
  },
};
