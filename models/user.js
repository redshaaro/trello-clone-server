module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define("user", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  // ✅ Define association inside the model file
  user.associate = function(models) {
    user.hasMany(models.board, { foreignKey: 'user_id' });
  };

  return user;
};
