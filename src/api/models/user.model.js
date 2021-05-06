const {
    Model,
    Op,
} = require('sequelize');

const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const jwt = require('jwt-simple');
const APIError = require('../utils/APIError');
const { jwtSecret, jwtExpirationInterval } = require('../../config/vars');
const { flatten } = require('lodash');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }

        static async findByIdOrAccountName({ id = null, accountName = '' }) {
            const account = await Account.findOne({
                where: {
                    [Op.or]: [
                        { id },
                        { accountName },
                    ],
                },
            });

            if (!account) {
                throw new APIError({
                    status: httpStatus.NO_CONTENT,
                    message: 'Not found account',
                });
            }

            return account;
        }

        static async get(accountId) {
            const account = await Account.findOne({
                where: {
                    id: accountId,
                },
                include: [
                    { association: 'permissions', attributes: ['permission'] },
                ],
            });

            if (!account) {
                throw new APIError({
                    status: httpStatus.NO_CONTENT,
                    message: 'Not found account',
                });
            }

            return account;
        }


        static async findAndGenerateToken(options) {
            const { accountName, password, refreshObject } = options;

            if (!accountName) throw new APIError({ message: 'Account name is required to generate a token' });

            const account = await this.findOne({
                where: {
                    accountName,
                },
            });

            const err = {
                status: httpStatus.UNAUTHORIZED,
                isPublic: true,
            };

            if (password) {
                if (account && await account.passwordMatches(password)) {
                    account.OTPVerified = false;
                    await account.save();
                    return { user: account.transform(), accessToken: account.token() };
                }
                err.message = 'Incorrect account name or password';
            } else if (refreshObject && refreshObject.accountName === accountName) {
                if (moment(refreshObject.expires).isBefore()) {
                    err.message = 'Invalid refresh token';
                } else {
                    return { user: account.transform(), accessToken: account.token() };
                }
            } else {
                err.message = 'Incorrect account name or refresh token';
            }

            // reset otp verified state
            account.OTPVerified = false;
            await account.save();

            throw new APIError(err);
        }

        static checkDuplicateUserName(error) {
            if (error.name === 'SequelizeUniqueConstraintError' && error.fields['Users.userName']) {
                return new APIError({
                    message: 'Validation Error',
                    errors: [{
                        field: 'accountName',
                        location: 'body',
                        messages: ['"accountName" already exists'],
                    }],
                    status: httpStatus.CONFLICT,
                    isPublic: true,
                    stack: error.stack,
                });
            }
            return error;
        }

        static async createUser({email, username, fullname, avatar}, loginUser) {
            const t = await sequelize.transaction();

            const insertData = {
                email,
                username,
                fullname,
                avatar,
            };

            insertData.status = 1;

            try {
                // Insert to User table
                const createdUser = await User.create({
                    ...insertData,
                    updatedBy: loginUser.username,
                }, {
                    transaction: t,
                });

                await t.commit();
                return createdUser;
            } catch (e) {
                await t.rollback();
                throw e;
            }
        }


        transform() {
            const transformed = {};
            const fields = [
                'id',
                'username',
                'avatar',
                'fullName',
                'status',
                'createdAt',
                'updatedAt',
            ];

            fields.forEach((field) => {
                transformed[field] = this[field];
            });

            return transformed;
        }

        // generate token for this user
        token() {
            const playload = {
                exp: moment().add(jwtExpirationInterval, 'minutes').unix(),
                iat: moment().unix(),
                sub: this.id,
            };
            return jwt.encode(playload, jwtSecret);
        }
    }
    User.init({
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            set(val) {
                this.setDataValue('username', val.toLowerCase().trim());
            },
        },
        fullname: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        avatar: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        status: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            validate: {
                isIn: [[0, 1]], // deleted, active
            },
            defaultValue: 1,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [6, 128],
            },
            set(val) {
                this.setDataValue('password', bcrypt.hashSync(val, 10));
            },
        },
    }, {
        sequelize,
        modelName: 'User',
        indexes: [
            { fields: ['username'], unique: true, name: 'username' },
        ],
    });
    return User;
}