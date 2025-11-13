'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('task_assignees', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      task_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tasks',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add unique constraint to prevent assigning same user twice
    await queryInterface.addConstraint('task_assignees', {
      fields: ['task_id', 'user_id'],
      type: 'unique',
      name: 'task_assignees_unique_task_user'
    });

    // Add indexes for faster queries
    await queryInterface.addIndex('task_assignees', ['task_id']);
    await queryInterface.addIndex('task_assignees', ['user_id']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('task_assignees');
  }
};
