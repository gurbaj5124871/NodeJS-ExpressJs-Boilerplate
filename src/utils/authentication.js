'use strict'

const bluebird          = require('bluebird'), 
    jwt                 = bluebird.promisifyAll(require('jsonwebtoken')),
    constants           = require('./constants'),
    sessions            = require('./sessions'),
    config              = require('../../config'),
    errify              = require('./errify'),
    errMsg              = require('./error-messages');

const secret            = config.get('/jwt/secret')

const verifyToken       = async (req, res, next) => {
    let token           = req.headers.authorization;
    if(token)           {
        try             {
            token       = token.split(' ')
            if(token.length !== 2 && token[0].toLowerCase() !== 'bearer')
                throw errify.unauthorized(errMsg['1018'], 1018)
            else token  = token[1]
            try         {
                const decode    = await jwt.verifyAsync(token, secret)
                const session   = (await sessions.getSessionFromToken(decode))[0]
                if(!session)
                    throw errify.unauthorized(errMsg['1018'], 1018)
                req.user= Object.assign(decode, JSON.parse(session))
                next()
            } catch(err){
                try {await sessions.expireSessionFromToken(jwt.decode(token, {json: true, complete: true}))} catch(err) {}
                throw errify.unauthorized(errMsg['1018'], 1018)
            }
        } catch (err)   {
            next(err)
        }
    } else next(errify.unauthorized(errMsg['1018'], 1018))
}

const verifyAdminToken  = async (req, res, next) => {
    let token           = req.headers.authorization;
    if(token)           {
        try             {
            token       = token.split(' ')
            if(token.length !== 2 && token[0].toLowerCase() !== 'bearer')
                throw errify.unauthorized(errMsg['1018'], 1018)
            else token  = token[1]
            try         {
                const decode    = await jwt.verifyAsync(token, secret)
                if(decode.role !== constants.userRoles.admin)
                    throw errify.badRequest(errMsg['1018'], 1018)
                const session   = (await sessions.getSessionFromToken(decode))[0]
                if(!session)
                    throw errify.unauthorized(errMsg['1018'], 1018)
                req.user= Object.assign(decode, JSON.parse(session))
                next()
            } catch(err){
                try {await sessions.expireSessionFromToken(jwt.decode(token, {json: true, complete: true}))} catch(err) {}
                throw errify.unauthorized(errMsg['1018'], 1018)
            }
        } catch (err)   {
            next(err)
        }
    } else next(errify.unauthorized(errMsg['1018'], 1018))
}

const verifyTokenIfExists   = async (req, res, next) => {
    if(req.headers.authorization)
        return verifyToken(req, res, next)
    else next()
}

const generateToken         = async (userId, sessionId, role, roles, platform) => {
    const expiry            = config.get(`/jwt/expireAfter/${role}/${platform}`) || '1d';
    return jwt.signAsync({
        userId: userId.toString(), sessionId: sessionId.toString(),
        role, roles, issuer: 'dhandahub.com'}, secret, {expiresIn: expiry
    })
}

module.exports      = {
    verifyToken,
    verifyAdminToken,
    verifyTokenIfExists,
    generateToken
}