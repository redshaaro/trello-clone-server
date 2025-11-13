module.exports = (sequelize, DataTypes) => {
    const board_member = sequelize.define("board_member", {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        board_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "boards",
                key: "id"
            }
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        role: {
            type: DataTypes.ENUM("OWNER", "ADMIN", "MEMBER", "VIEWER"),
            allowNull: false,
            defaultValue: "MEMBER"
        }
    }, {
        tableName: 'board_members',
        timestamps: true
    });

    // board.associate = function (models) {
    //     board.belongsTo(models.user, { foreignKey: 'user_id' });
    //     board.hasMany(models.column, { foreignKey: 'board_id' }); // ✅ Add this
    // };
    board_member.associate = function(models) {
    board_member.belongsTo(models.board, { foreignKey: 'board_id', onDelete: 'CASCADE' });
    board_member.belongsTo(models.user, { foreignKey: 'user_id', onDelete: 'CASCADE' });
};

    return board_member;
};
