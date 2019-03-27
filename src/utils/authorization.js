const AccessControl = require('accesscontrol'),
    constants       = require('../utils/constants'),
    resource        = constants.resource;
let role            = {};

const accessControl = new AccessControl()
for(let key in constants.accessRoles)
    role = Object.assign(role, constants.accessRoles[key])

// Customer Specific
accessControl
    .grant(role.customer)
    .readAny(resource.businessTypes)
    .readAny(resource.businessSubTypes)

// Service Provider Specific
accessControl
    .grant(role.serviceProvider)
    .readAny(resource.businessTypes)
    .create(resource.businessTypes)
    .readAny(resource.businessSubTypes)
    .create(resource.businessSubTypes)

// Admin Specific
accessControl
    .grant(role.admin)
    .create(resource.admin)
    .readAny(resource.businessTypes)
    .create(resource.businessTypes)
    .updateAny(resource.businessTypes)
    .create(resource.businessSubTypes)
    .readAny(resource.businessSubTypes)
    .updateAny(resource.businessSubTypes)
    .create(resource.serviceProvider)
    .create(resource.customer)

const accessAllowed = (actionName, resource) => {
    return (req, res, next) => {
        try {
            const permission = accessControl.can(req.user.roles)[actionName](resource)
            if (permission.granted === true)
                next()
            else
                next(new Error())
        } catch (err) {
            next(err)
        }
    }
}

module.exports      = {
    accessAllowed,
    accessControl
}
