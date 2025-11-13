'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("invitations", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      board_id: {
        type: Sequelize.INTEGER,
        allowNull: false, onDelete: 'CASCADE',
        references: {
          model: "boards",
          key: "id"
        },


      },
      inviter_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },

        onDelete: "SET NULL"

      },
      invitee_email: {
        type: Sequelize.STRING,
        allowNull: false,


      },
      role: {
        type: Sequelize.ENUM("OWNER", "ADMIN", "MEMBER", "VIEWER"),
        allowNull: false,
        required: true

      },
      token_hash: {
        type: Sequelize.STRING,
        allowNull: false

      },

      status: {
        type: Sequelize.ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'EXPIRED'),
        defaultValue: "PENDING"

      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
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
    await queryInterface.dropTable('invitations');
  }
};
