module.exports = (sequelize, DataTypes) => {
  const board = sequelize.define("board", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  });

  board.associate = function(models) {
    board.belongsTo(models.user, { foreignKey: 'user_id' });
    board.hasMany(models.column, { foreignKey: 'board_id' }); // ✅ Add this
  };

  return board;
};
