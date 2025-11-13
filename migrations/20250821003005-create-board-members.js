'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("board_members", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      board_id: {
        type: Sequelize.INTEGER,
        allowNull: false, onDelete: 'CASCADE',
        references: {
          model: "boards",
          key: "id"
        },


      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',

      },
      role: {
        type: Sequelize.ENUM("OWNER", "ADMIN", "MEMBER", "VIEWER")
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('board_members');
  }
};
