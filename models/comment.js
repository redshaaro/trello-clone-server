// models/comment.js
module.exports = (sequelize, DataTypes) => {
  const comment = sequelize.define("comment", {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    text: { 
      type: DataTypes.TEXT, 
      allowNull: false 
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
    tableName: 'comments',
    timestamps: true
  });

  comment.associate = function(models) {
    comment.belongsTo(models.task, { foreignKey: 'task_id', onDelete: 'CASCADE' });
    comment.belongsTo(models.user, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  };

  return comment;
};

