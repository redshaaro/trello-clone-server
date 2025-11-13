module.exports = (sequelize, DataTypes) => {
    const invitation = sequelize.define("invitation", {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        board_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "boards",
                key: "id"
            }
        },
        inviter_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        invitee_email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM("OWNER", "ADMIN", "MEMBER", "VIEWER"),
            allowNull: false
        },
        token_hash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'EXPIRED'),
            defaultValue: "PENDING",
            allowNull: false
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'invitations',
        timestamps: true
    });

    invitation.associate = function(models) {
        invitation.belongsTo(models.board, { foreignKey: 'board_id', onDelete: 'CASCADE' });
        invitation.belongsTo(models.user, { as: 'inviter', foreignKey: 'inviter_id', onDelete: 'SET NULL' });
    };

    return invitation;
};
