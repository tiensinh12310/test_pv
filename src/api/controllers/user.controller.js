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
        next(error)
    }
};

exports.getList = async (req, res, next) => {
    try {
        const data = await User.list(req.query)
        res.json(data)
    } catch(e) {
        next(e)
    }
}

exports.updateUser = async (req, res, next) => {
    try {
        const {userId, username, fullname, deleted, status} = req.body
        const user = await User.getUserById(userId);
        if(username) {
            user.username = username
        }
        if(fullname) {
            user.fullname = fullname
        }
        if(deleted) {
            user.deleted = deleted
        }
        if(status) {
            user.status = status
        }
        await user.save()
        res.json(true)
    } catch (e) {
        next(e)
    }
}
