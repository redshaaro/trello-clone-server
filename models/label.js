// models/label.js
module.exports = (sequelize, DataTypes) => {
  const label = sequelize.define("label", {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    name: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    color: { 
      type: DataTypes.STRING, 
      allowNull: false,
      defaultValue: '#3b82f6' // blue
    }
  }, {
    tableName: 'labels',
    timestamps: true
  });

  label.associate = function(models) {
    // Many-to-many with tasks through task_labels
    label.belongsToMany(models.task, {
      through: 'task_labels',
      foreignKey: 'label_id',
      otherKey: 'task_id',
      onDelete: 'CASCADE'
    });
  };

  return label;
};

