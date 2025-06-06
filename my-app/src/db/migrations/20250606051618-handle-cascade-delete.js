'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // --- REMOVE DUPLICATES ---

    // Users Table
    await queryInterface
      .removeConstraint('users', 'users_ibfk_1')
      .catch(() => {});
    await queryInterface
      .removeConstraint('users', 'users_ibfk_2')
      .catch(() => {});
    await queryInterface
      .removeConstraint('users', 'fk_users_role_id')
      .catch(() => {});
    await queryInterface
      .removeConstraint('users', 'fk_users_parent_id')
      .catch(() => {});

    // Roles Table
    await queryInterface
      .removeConstraint('roles', 'roles_ibfk_1')
      .catch(() => {});
    await queryInterface
      .removeConstraint('roles', 'fk_roles_creator_id_users_id')
      .catch(() => {});
    await queryInterface
      .removeConstraint('roles', 'fk_roles_parent_id')
      .catch(() => {});
    await queryInterface
      .removeConstraint('roles', 'fk_roles_creator_id')
      .catch(() => {});

    // Role_Permissions Table
    await queryInterface
      .removeConstraint('role_permissions', 'role_permissions_ibfk_1')
      .catch(() => {});
    await queryInterface
      .removeConstraint('role_permissions', 'role_permissions_ibfk_2')
      .catch(() => {});
    await queryInterface
      .removeConstraint('role_permissions', 'fk_role_permissions_role_id')
      .catch(() => {});
    await queryInterface
      .removeConstraint('role_permissions', 'fk_role_permissions_permission_id')
      .catch(() => {});

    // --- RE-ADD CLEAN CONSTRAINTS ---

    // USERS
    await queryInterface.addConstraint('users', {
      fields: ['role_id'],
      type: 'foreign key',
      name: 'fk_users_role_id',
      references: {
        table: 'roles',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('users', {
      fields: ['parent_id'],
      type: 'foreign key',
      name: 'fk_users_parent_id',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // ROLES
    await queryInterface.addConstraint('roles', {
      fields: ['parent_id'],
      type: 'foreign key',
      name: 'fk_roles_parent_id',
      references: {
        table: 'roles',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('roles', {
      fields: ['creator_id'],
      type: 'foreign key',
      name: 'fk_roles_creator_id',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // ROLE_PERMISSIONS
    await queryInterface.addConstraint('role_permissions', {
      fields: ['role_id'],
      type: 'foreign key',
      name: 'fk_role_permissions_role_id',
      references: {
        table: 'roles',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('role_permissions', {
      fields: ['permission_id'],
      type: 'foreign key',
      name: 'fk_role_permissions_permission_id',
      references: {
        table: 'permissions',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('users', 'fk_users_role_id');
    await queryInterface.removeConstraint('users', 'fk_users_parent_id');
    await queryInterface.removeConstraint('roles', 'fk_roles_parent_id');
    await queryInterface.removeConstraint('roles', 'fk_roles_creator_id');
    await queryInterface.removeConstraint(
      'role_permissions',
      'fk_role_permissions_role_id',
    );
    await queryInterface.removeConstraint(
      'role_permissions',
      'fk_role_permissions_permission_id',
    );
  },
};
