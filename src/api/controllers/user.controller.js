const httpStatus = require('http-status');
const { omit } = require('lodash');
const { User } = require('../../config/mysql');

/**
 * Create new user
 * @public
 */
exports.create = async (req, res, next) => {
    try {
        const savedUser = await User.createUser(req.body);
        res.status(httpStatus.CREATED);
        res.json(savedUser.transform());
    } catch (error) {
        next(error)
    }
};

exports.getUser = async (req, res, next) => {
    try {
        const { id } = req.query
        const user = await User.findOne({
            where: {
                id
            },
        });
        res.json(user);
    } catch (error) {
        console.log(error)
        next(error)
    }
};
