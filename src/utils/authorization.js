'use strict'

const AccessControl = require('accesscontrol'),
    constants       = require('./constants'),
    errify          = require('./errify'),
    errMsg          = require('./error-messages'),
    resource        = constants.resource;

const role          = Object.keys(constants.accessRoles).reduce((res, obj) => Object.assign(res, constants.accessRoles[obj]), {});
const accessControl = new AccessControl()

// Customer Specific
accessControl
    .grant(role.customer)
    .readAny(resource.businessTypes)
    .readAny(resource.businessSubTypes)
    .readAny(resource.serviceProvider, [
        '*', '!password', '!isBlocked', '!isDeleted', '!lastActivityAt', '!ownershipType', '!noOfCustomersFollowing',
        '!isEmailVerified', '!isPhoneVerified', '!emailVerificationToken', '!phoneVerificationToken', '!businessModelTypes'
    ])
    .readAny(resource.customer, [
        '*', '!password', '!emailVerificationToken', '!phoneVerificationToken', '!facebookId', '!googleId','!dob', '!lastActivityAt',
        '!googleLocation', '!noOfBusinessesFollowed', '!isBlocked', '!isDeleted', '!isEmailVerified', '!isPhoneVerified', '!gender', '!isSignupComplete'
    ])
    .readOwn(resource.customer, ['*', '!password', '!emailVerificationToken', '!phoneVerificationToken', '!lastActivityAt'])
    .updateOwn(resource.customer)

// Service Provider Specific
accessControl
    .grant(role.serviceProvider)
    .readAny(resource.businessTypes)
    .create(resource.businessTypes)
    .readAny(resource.businessSubTypes)
    .create(resource.businessSubTypes)
    .readAny(resource.serviceProvider, [
        '*', '!password', '!isBlocked', '!isDeleted', '!lastActivityAt', '!ownershipType', '!businessSubTypes',
        '!isEmailVerified', '!isPhoneVerified', '!emailVerificationToken', '!phoneVerificationToken', '!businessModelTypes', '!noOfCustomersFollowing'
    ])
    .readOwn(resource.serviceProvider, ['*', '!password', '!emailVerificationToken', '!phoneVerificationToken', '!lastActivityAt'])
    .readAny(resource.customer, [
        '*', '!password', '!emailVerificationToken', '!phoneVerificationToken', '!facebookId', '!googleId','!dob', '!lastActivityAt',
        '!googleLocation', '!noOfBusinessesFollowed', '!isBlocked', '!isDeleted', '!isEmailVerified', '!isPhoneVerified', '!gender', '!isSignupComplete'
    ])
    .updateOwn(resource.serviceProvider)

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
    .readAny(resource.serviceProvider, ['*', '!password','!emailVerificationToken', '!phoneVerificationToken', '!facebookId', '!googleId'])
    .readAny(resource.customer, ['*', '!password','!emailVerificationToken', '!phoneVerificationToken', '!facebookId', '!googleId'])
    .readAny(resource.allServiceProviders, ['*', '!password','!emailVerificationToken', '!phoneVerificationToken', '!facebookId', '!googleId'])
    .readAny(resource.allCustomers, ['*', '!password','!emailVerificationToken', '!phoneVerificationToken', '!facebookId', '!googleId'])
    .updateAny(resource.serviceProvider)
    .updateAny(resource.customer)

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
