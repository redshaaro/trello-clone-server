'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add unique constraint to username field
    await queryInterface.addConstraint('users', {
      fields: ['username'],
      type: 'unique',
      name: 'users_username_unique'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove unique constraint from username field
    await queryInterface.removeConstraint('users', 'users_username_unique');
  }
};
