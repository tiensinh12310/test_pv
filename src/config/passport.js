const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const { jwtSecret } = require('./vars');

const { User } = require('./mysql');

const jwtOptions = {
    secretOrKey: jwtSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
};

const jwt = async (payload, done) => {
    try {
        const user = await User.findOne({
            where: {
                id: payload.sub
            }
        });
        if(user) return done(null, user);
        return done(null, false);
    } catch (e) {
        return done(e, false);
    }
}

exports.jwt = new JwtStrategy(jwtOptions, jwt);