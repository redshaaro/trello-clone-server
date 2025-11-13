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
    },
    background_url: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    }
  });

  board.associate = function(models) {
    board.belongsTo(models.user, { foreignKey: 'user_id' });
    board.hasMany(models.column, { foreignKey: 'board_id' });
    board.hasMany(models.board_member, { foreignKey: 'board_id' });
    board.hasMany(models.invitation, { foreignKey: 'board_id' });
  };
 

  return board;
};
