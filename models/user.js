// models/user.js
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define("user", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true
    }
  });

  user.associate = function(models) {
    user.hasMany(models.board, { foreignKey: 'user_id' });
    user.hasMany(models.board_member, { foreignKey: 'user_id' });
    user.hasMany(models.invitation, { as: 'invitations_sent', foreignKey: 'inviter_id' });
    user.hasMany(models.comment, { foreignKey: 'user_id' });
    
    // Many-to-many with tasks (as assignee)
    user.belongsToMany(models.task, {
      through: 'task_assignees',
      as: 'assigned_tasks',
      foreignKey: 'user_id',
      otherKey: 'task_id',
      onDelete: 'CASCADE'
    });
  };

  return user;
};
