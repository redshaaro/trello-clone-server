// models/task_assignee.js
module.exports = (sequelize, DataTypes) => {
  const task_assignee = sequelize.define("task_assignee", {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tasks',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  }, {
    tableName: 'task_assignees',
    timestamps: true // Changed to true to match Sequelize expectations
  });

  task_assignee.associate = function(models) {
    task_assignee.belongsTo(models.task, { foreignKey: 'task_id', onDelete: 'CASCADE' });
    task_assignee.belongsTo(models.user, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  };

  return task_assignee;
};

