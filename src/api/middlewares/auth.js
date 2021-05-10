const httpStatus = require('http-status');
const passport = require('passport');
const { User } = require('../../config/mysql');
const APIError = require('../utils/APIError');

const OPEN = 1;

const handleJWT = (req, res, next, status) => async (err, user, info) => {
    const error = err || info;
    const logIn = Promise.promisify(req.logIn);
    const apiError = new APIError({
        message: error ? error.message : 'Unauthorized',
        status: httpStatus.UNAUTHORIZED,
        stack: error ? error.stack : undefined,
    });

    try {
        if (error || !user) throw error;
        await logIn(user, { session: false });
    } catch (e) {
        return next(apiError);
    }

    if (status === OPEN) {
        if (user.status !== OPEN && req.params.userId !== user.id.toString()) {
            apiError.status = httpStatus.FORBIDDEN;
            apiError.message = 'Forbidden';
            return next(apiError);
        }
    } else if (err || !user) {
        return next(apiError);
    }

    req.user = user;

    return next();
};

exports.OPEN = OPEN;

exports.authorize = (status = User.status) => (req, res, next) =>
    passport.authenticate(
        'jwt', { session: false },
        handleJWT(req, res, next, status),
    )(req, res, next);

exports.oAuth = service =>
    passport.authenticate(service, { session: false });
