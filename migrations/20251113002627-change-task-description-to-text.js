'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Change description column from STRING to TEXT to allow longer descriptions
    await queryInterface.changeColumn('tasks', 'description', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    // Revert description column back to STRING
    await queryInterface.changeColumn('tasks', 'description', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};
