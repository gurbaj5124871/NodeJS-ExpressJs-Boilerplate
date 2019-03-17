const AccessControl = require('accesscontrol'),
    constants       = require('../utils/constants'),
    role            = constants.roles,
    resource        = constants.resource;

const accessControl = new AccessControl()

// User specific
accessControl
    .grant(role.user)
    .readAny(resource.user, ['*']) // update these accordingly
    .readOwn(resource.user, ['*', '!tracking']) // update these accordingly
    .updateOwn(resource.user)

// Customer Specific
accessControl
    .grant(role.customer)
    .extend(role.user)

// Service Provider Specific
accessControl
    .grant(role.serviceProvider)
    .extend(role.user)


// Admin Specific
accessControl
    .grant(role.admin)
    .extend(role.user)

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
