const httpStatus = require('http-status');
const { User, RefreshToken } = require('../../config/mysql');
const moment = require('moment-timezone');
const { jwtExpirationInterval } = require('../../config/vars');
const APIError = require('../utils/APIError');

/**
 * Returns a formatted object with tokens
 * @private
 */
async function generateTokenResponse(user, accessToken) {
    const tokenType = 'Bearer';
    const refreshToken = await RefreshToken.generate(user).token;
    const expiresIn = moment().add(jwtExpirationInterval, 'minutes');
    return {
        tokenType,
        accessToken,
        refreshToken,
        expiresIn,
    };
}

/**
 * Returns jwt token if registration was successful
 * @public
 */
exports.register = async (req, res, next) => {
    try {
        const savedUser = await User.createUser(req.body);
        const userTransformed = savedUser.transform();
        const token = await generateTokenResponse(savedUser, savedUser.token());
        res.status(httpStatus.CREATED);
        return res.json({ token, user: userTransformed });
    } catch (error) {
        next(User.checkDuplicateEmail(error))
    }
};

/**
 * Returns jwt token if valid username and password is provided
 * @public
 */
exports.login = async (req, res, next) => {
    try {
        const { user, accessToken } = await User.findAndGenerateToken(req.body);
        const token = await generateTokenResponse(user, accessToken);
        return res.json({ token, user });
    } catch (error) {
        return next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        return res.json(true);
    } catch (error) {
        return next(error);
    }
};

/**
 * login with an existing user or creates a new one if valid accessToken token
 * Returns jwt token
 * @public
 */
exports.oAuth = async (req, res, next) => {
    try {
        const { user } = req;
        const accessToken = user.token();
        const token = generateTokenResponse(user, accessToken);
        const userTransformed = user.transform();
        return res.json({ token, user: userTransformed });
    } catch (error) {
        return next(error);
    }
};

/**
 * Returns a new jwt when given a valid refresh token
 * @public
 */
exports.refresh = async (req, res, next) => {
    try {
        const { email, refresh_token } = req.body;
        const refreshObject = await RefreshToken.findOne({
            where: {
                email,
                token: refresh_token,
            },
            raw: true
        });
        if(!refreshObject) {
            throw new APIError({
                status: httpStatus.UNAUTHORIZED,
                message: 'Invalid token',
            });
        }
        const { user, accessToken } = await User.findAndGenerateToken({ email, refreshObject });
        const response = await generateTokenResponse(user, accessToken);
        return res.json(response);
    } catch (error) {
        return next(error);
    }
};

