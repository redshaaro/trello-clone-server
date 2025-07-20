module.exports = (sequelize, DataTypes) => {
  const task = sequelize.define("task", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false },
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
  };

  return task;
};
