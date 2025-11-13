'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('task_labels', {
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
      label_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'labels',
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

    // Add unique constraint to prevent duplicate label assignments
    await queryInterface.addConstraint('task_labels', {
      fields: ['task_id', 'label_id'],
      type: 'unique',
      name: 'task_labels_unique_task_label'
    });

    // Add indexes for faster queries
    await queryInterface.addIndex('task_labels', ['task_id']);
    await queryInterface.addIndex('task_labels', ['label_id']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('task_labels');
  }
};
