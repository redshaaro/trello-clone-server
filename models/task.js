module.exports = (sequelize, DataTypes) => {
  const task = sequelize.define("task", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM('todo', 'in-progress', 'done'),
      defaultValue: "todo",
      allowNull: false
    },
    column_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "columns",
        key: "id"
      },
      onDelete: 'CASCADE'
    }, position: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  });

  task.associate = function (models) {
    task.belongsTo(models.column, { foreignKey: 'column_id' });
    task.hasMany(models.comment, { foreignKey: 'task_id', onDelete: 'CASCADE' });
    
    // Many-to-many with labels through task_labels
    task.belongsToMany(models.label, {
      through: 'task_labels',
      foreignKey: 'task_id',
      otherKey: 'label_id',
      onDelete: 'CASCADE'
    });

    // Many-to-many with users (assignees) through task_assignees
    task.belongsToMany(models.user, {
      through: 'task_assignees',
      as: 'assignees',
      foreignKey: 'task_id',
      otherKey: 'user_id',
      onDelete: 'CASCADE'
    });
  };

  return task;
};
