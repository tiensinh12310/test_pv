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
            User.hasOne(models.RefreshToken);
        }

        static async get(userId) {
            const user = await this.findOne({
                where: {
                    id: userId,
                }
            });

            if (!user) {
                throw new APIError({
                    status: httpStatus.NO_CONTENT,
                    message: 'Not found user',
                });
            }

            return user;
        }

        static checkDuplicateUserName(error) {
            if (error.name === 'SequelizeUniqueConstraintError' && error.fields['Users.userName']) {
                return new APIError({
                    message: 'Validation Error',
                    errors: [{
                        field: 'username',
                        location: 'body',
                        messages: ['"username" already exists'],
                    }],
                    status: httpStatus.CONFLICT,
                    isPublic: true,
                    stack: error.stack,
                });
            }
            return error;
        }

        static async createUser(data) {
            const t = await sequelize.transaction();
            const { email, username, password, fullname, avatar, deleted } = data

            const insertData = {
                email,
                username,
                fullname,
                password,
                avatar,
                deleted,
            };

            insertData.status = 1;

            try {
                // Insert to User table
                const createdUser = await User.create({
                    ...insertData
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

        static async list(data) {
            const { page, size, isPagination, username, status } = data;
            const pageNumber = Number(page);
            const pageSize = Number(size);

            const offset = (pageNumber - 1) * pageSize;
            const limit = pageSize;

            const condition = {}

            if(username) {
                condition.username = { [Op.like]: `%${username}`};
            }
            if(status) {
                condition.status = status
            }

            // option: order, pagination
            const options = {};
            options.order = [['username', 'ASC'], ['status', 'ASC']];

            if(isPagination) {
                options.offset = offset;
                options.limit = limit;
            }

            const attributes = [
                'username',
                'fullname',
                'status',
                'deleted',
                'createdAt',
                'updatedAt',
            ]

            const { rows: records, count: totalRecords } = await this.findAndCountAll({
                attributes,
                where: condition,
                limit,
                offset
            });

            return {
                page: pageNumber,
                size: pageSize,
                records,
                totalRecords,
                totalPages: Math.ceil(totalRecords / pageSize),
            }
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
        deleted: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        }
    }, {
        sequelize,
        modelName: 'User',
        indexes: [
            { fields: ['username'], unique: true, name: 'username' },
        ],
    });
    return User;
}