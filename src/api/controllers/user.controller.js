const httpStatus = require('http-status');
const { omit } = require('lodash');
const User = require('../models/user.model');

/**
 * Create new user
 * @public
 */
exports.create = async (req, res, next) => {
    try {
        const user = new User(req.body);
        const savedUser = await user.save();
        res.status(httpStatus.CREATED);
        res.json(savedUser.transform());
    } catch (error) {
        next(User.checkDuplicateUsername(error));
    }
};

/**
 * Update existing user
 * @public
 */
exports.update = (req, res, next) => {
    const ommitRole = req.locals.user.role !== 'admin' ? 'role' : '';
    const updatedUser = omit(req.body, ommitRole);
    const user = Object.assign(req.locals.user, updatedUser);

    user.save()
        .then(savedUser => res.json(savedUser.transform()))
        .catch(e => next(User.checkDuplicateUsername(e)));
};


/**
 * Get user list
 * @public
 */
exports.list = async (req, res, next) => {
    try {
        const users = await User.list(req.query);
        const transformedUsers = users.map(user => user.transform());
        res.json(transformedUsers);
    } catch (error) {
        next(error);
    }
};


/**
 * Delete user
 * @public
 */
exports.remove = (req, res, next) => {
    const { user } = req.locals;

    user.remove()
        .then(() => res.status(httpStatus.NO_CONTENT).end())
        .catch(e => next(e));
};