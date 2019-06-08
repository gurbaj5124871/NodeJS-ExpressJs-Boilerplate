'use strict'

const mongo                     = require('../../utils/mongo'),
    bcrypt                      = require('../../utils/bcrypt'),
    sessions                    = require('../../utils/sessions'), 
    authentication              = require('../../utils/authentication'),
    constants                   = require('../../utils/constants'),
    errify                      = require('../../utils/errify'),
    errMsg                      = require('../../utils/error-messages'),
    Admin                       = require('./admin-model');

const login                     = async (req, res, next) => {
    try {
        const {email, password} = req.body, {platform, deviceToken} = req.headers;
        const admin             = await mongo.findOne(Admin, {email}, {__v: 0}, {lean: true})
        if(!admin)
            throw errify.unauthorized(errMsg[1000], '1000')
        if(!await bcrypt.comparePassword(password, admin.password))
            throw errify.unauthorized(errMsg[1002], '1002')
        const sessionId         = await sessions.createSession(admin._id, constants.userRoles.admin, admin.roles, platform, deviceToken)
        admin['authorization']  = await authentication.generateToken(admin._id, sessionId, constants.userRoles.admin, admin.roles, platform)
        delete admin.password
        return res.send(admin)
    } catch (err) {
        next(err)
    }
}

const createAdmin               = async (req, res, next) => {
    try {
        let admin               = req.body
        admin.password          = await bcrypt.hashPassword(admin.password)
        admin                   = await mongo.createOne(Admin, admin)
        delete admin.password
        return res.send({success: true})
    } catch (err) {
        if(typeof err === 'object' && err.name === 'MongoError' && err.code === 11000)
        err = errify.conflict(errMsg[1003], '1002')
        next(err)
    }
}

module.exports                  = {
    login,
    createAdmin
}