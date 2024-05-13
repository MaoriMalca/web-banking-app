const { expressjwt: expressJwt } = require('express-jwt');

exports.isSignedIn = expressJwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'auth',
    algorithms: ['HS256'],
});