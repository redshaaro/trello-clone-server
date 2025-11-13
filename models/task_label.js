// models/task_label.js
module.exports = (sequelize, DataTypes) => {
  const task_label = sequelize.define("task_label", {
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
    label_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'labels',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  }, {
    tableName: 'task_labels',
    timestamps: true // Changed to true to match Sequelize expectations
  });

  task_label.associate = function(models) {
    task_label.belongsTo(models.task, { foreignKey: 'task_id', onDelete: 'CASCADE' });
    task_label.belongsTo(models.label, { foreignKey: 'label_id', onDelete: 'CASCADE' });
  };

  return task_label;
};

