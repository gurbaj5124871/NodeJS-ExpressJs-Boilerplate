'use strict'

const AccessControl = require('accesscontrol'),
    constants       = require('./constants'),
    errify          = require('./errify'),
    errMsg          = require('./error-messages'),
    resource        = constants.resource;

const role          = Object.keys(constants.accessRoles).reduce((res, obj) => Object.assign(res, constants.accessRoles[obj]), {});
const accessControl = new AccessControl()

// Admin Specific
accessControl
    .grant(role.admin)
    .create(resource.admin)

const accessAllowed = (actionName, resource) => {
    return (req, res, next) => {
        try {
            const permission = accessControl.can(req.user.roles)[actionName](resource)
            if (permission.granted === true)
                next()
            else
                next(errify.unauthorized(errMsg['1000'], 1000))
        } catch (err) {
            next(err)
        }
    }
}

module.exports      = {
    accessAllowed,
    accessControl
}
