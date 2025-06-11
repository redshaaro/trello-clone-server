module.exports = (sequelize, DataTypes) => {
  const column = sequelize.define("column", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    board_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'boards',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  });

  column.associate = function(models) {
    column.belongsTo(models.board, { foreignKey: 'board_id' });
    column.hasMany(models.task, { foreignKey: 'column_id' }); // ✅ Now tasks belong here
  };

  return column;
};
