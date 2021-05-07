const {
    Model,
} = require('sequelize');
const crypto = require('crypto');
const moment = require('moment-timezone');

module.exports = (sequelize, DataTypes) => {
    class RefreshToken extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            RefreshToken.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user',
                onDelete: 'CASCADE'
            });
        }

        static async generate(user) {
            const {id: userId, email} = user;
            // destroy all old refresh token
            await RefreshToken.destroy({where: {userId}});
            const token = `${userId}.${crypto.randomBytes(40).toString('hex')}`;
            const expires = moment().add(30, 'days').toDate();
            const tokenObject = await RefreshToken.create({
                token, userId, expires, email
            });
            return tokenObject.toJSON();
        }
    }

    RefreshToken.init({
        token: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        expires: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'RefreshToken'
    });
    return RefreshToken;
};
