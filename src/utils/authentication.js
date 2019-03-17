const bluebird          = require('bluebird'), 
    jwt                 = bluebird.promisifyAll(require('jsonwebtoken')),
    config              = require('../../app-config'),
    constants           = require('./constants'),
    errify              = require('./errify');

const secret            = config.get('/jwt/secret')

const verifyToken       = async (req, res, next) => {
    const token         = req.headers.authorization
    try {
        if (token && token.split(' ').length > 0 && token.split(' ')[0].toLowerCase() === 'bearer') {
            const decoded   = await jwt.verifyAsync(token.split(' ')[1], secret)
            req.user        = decoded
            next()
        }
        else throw new Error()
    } catch (err) {
        next(errify.unauthorized('Token Expired', '1052'))
    }
}

const verifyTokenIfExists   = async (req, res, next) => {
    const token             = req.headers.authorization
    if (token && token.split(' ').length > 0 && token.split(' ')[0].toLowerCase() === 'bearer') {
        try {
            const decoded   = await jwt.verifyAsync(token.split(' ')[1])
            req.user        = decoded
            next()
        } catch (err) {
            next(errify.unauthorized('Token Expired', '1052'))
        }
    }
    else next()
}

const generateToken         = async (userId, roles, platform) => {
    const role              = roles.includes(constants.roles.admin) ? constants.roles.admin : constants.roles.user;
    const expiry            = config.get(`/jwt/expireAfter/${role}/${platform}`) || '1d';
    return jwt.signAsync({userId, roles, issuer: 'dhandaHub.com'}, secret, {expiresIn: expiry})
}

module.exports      = {
    verifyToken,
    verifyTokenIfExists,
    generateToken
}