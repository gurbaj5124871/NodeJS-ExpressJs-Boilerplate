'use strict'

const Customer                  = require('./customer-model'),
    {redis, redisKeys}          = require('../../utils/redis'),
    constants                   = require('../../utils/constants'),
    mongo                       = require('../../utils/mongo'),
    errify                      = require('../../utils/errify'),
    errMsg                      = require('../../utils/error-messages'),
    authentication              = require('../../utils/authentication'),
    universalFunc               = require('../../utils/universal-functions'),
    sessions                    = require('../../utils/sessions'),
    logger                      = require('../../utils/logger'),
    accessControl               = require('../../utils/authorization').accessControl,
    resource                    = constants.resource,
    randomNumber                = require('../../utils/random-number-generator')
                                        .generator({min: 100000, max: 999999, integer: true});

const cpExistanceCheckViaPhone  = async phoneNumber => {
    const customer              = await Customer.findOne({phoneNumber, isDeleted: {$ne: true}}, {_id: 1}).lean() // isPhoneVerified: true,
    return customer !== null ? true : false;
}

const generatePhoneVerification = phoneNumber => {
    const OTP                   = randomNumber()
    return redis.setAsync(redisKeys.customerPhoneVerification(phoneNumber), OTP, 'EX', 5 * 60) // valid for 5 min
}

const expirePhoneVerification   = phoneNumber => redis.delAsync(redisKeys.customerPhoneVerification(phoneNumber))

const phoneVerificationCheck    = async (phoneNumber, OTP) => {
    const match                 = await redis.getAsync(redisKeys.customerPhoneVerification(phoneNumber))
    if(!match || match !== OTP)
        return false
    return true
}

const createCustomerViaPhone    = async body => {
    if(await cpExistanceCheckViaPhone(body.phoneNumber) === true)
        throw errify.conflict(errMsg['1004'], 1004)
    const customer              = {
        firstName: body.firstName, lastName: body.lastName, phoneNumber: body.phoneNumber, extention: body.extention,
        roles: [constants.accessRoles.customer.customer], isPhoneVerified: true, lastActivityAt: new Date(), imageUrl: body.imageUrl
    }
    if(!customer.firstName || !customer.lastName)
        customer.isSignupComplete = false
    else customer.isSignupComplete= true
    return mongo.createOne(Customer, customer)
}

const updateCustomer            = (customerId, data) => {
    const options               = {lean: true, new: true, useFindAndModify: false, projection: {
        __v: 0, isDeleted: 0, lastActivityAt: 0, createdAt: 0, updatedAt: 0
    }}
    return Customer.findOneAndUpdate({_id: customerId}, {$set: data}, options)
}

const cacheCpBasicDetails       = customer => {
    const userRedisKey          = redisKeys.user(customer._id)
    const basicDetails          = JSON.stringify({
        _id: customer._id, name: `${customer.firstName} ${customer.lastName}`, userType: constants.userRoles.customer,
        firstName: customer.firstName, lastName: customer.lastName, imageUrl: customer.imageUrl
    })
    return redis.setexAsync(userRedisKey, universalFunc.convertDaysToSeconds(30), basicDetails)
}

function getCustomer(criteria, projections = {}) {
    if(Object.keys(projections).length === 0)
    projections     = {lastActivityAt: 0, __v: 0, createdAt: 0, updatedAt: 0}
    const pipeline  = [{$match: criteria}, {$project: projections}]
    if(projections.businessInterests)
        pipeline.push([
            {$lookup: {from: 'businesssubtypes', localField: 'businessInterests', foreignField: '_id', as: 'businessInterests'}},
            {$addFields: {businessInterests: {$map: {input: '$businessInterests', as: 'bst', in: {
                name: '$$bst.name', businessTerm: '$$bst.businessTerm', customerTerm: '$$bst.customerTerm', imageUrl: '$$bst.imageUrl'
            }}}}}
        ])
    return mongo.aggregate(Customer, pipeline)
}

const getCustomerByPhoneNumber  = async phoneNumber => {
    const customer              = await getCustomer({phoneNumber, isPhoneVerified: true, isDeleted: {$ne: true}})
    return customer.length ? customer[0] : null
}

const getCustomerById           = async (_id, projections) => {
    const customer              = await getCustomer({_id: mongo.getObjectId(_id), isDeleted: {$ne: true}}, projections)
    return customer.length ? customer[0] : null
}

const createSession             = async (userId, roles, platform, deviceToken, appVersion) => {
    const sessionId             = await sessions.createSession(userId, constants.userRoles.customer, roles, platform, deviceToken, appVersion)
    return authentication.generateToken(userId, sessionId, constants.userRoles.customer, roles, platform)
}

const expireSession             = (userId, sessionId) => sessions.expireSessionFromToken({payload: {userId, sessionId, role: constants.userRoles.customer}})

const updateCPLastActivity      = _id => {
    try {
        return mongo.updateOne(Customer, {_id}, {$set: {lastActivityAt: new Date()}})
    } catch (err) {
        logger.warn({message: `Error while updating service providers lastActivityAt`, err})
    }
} 

/**************************** PERMISSIONS and VALIDITY ***********************************/

const getCustomerAttributesPermission   = (requestCP, cpId) => {
    if (requestCP === undefined)
        throw errify.badRequest(errify.unauthorized(errMsg['1000'], 1000))
    else if (requestCP.userId === cpId)
        return accessControl.can(requestCP.roles).readOwn(resource.customer)
    else
        return accessControl.can(requestCP.roles).readAny(resource.customer)
}

const updateCustomerPermissionCheck     = (requestUser, cpId) => {
    if(accessControl.can(requestUser.roles).updateAny(resource.customer).granted)
        return true
    if(requestUser.userId !== cpId)
        throw errify.badRequest(errify.unauthorized(errMsg['1000'], 1000))
}

module.exports                  = {
    cpExistanceCheckViaPhone,
    generatePhoneVerification,
    expirePhoneVerification,
    phoneVerificationCheck,
    createCustomerViaPhone,
    updateCustomer,
    cacheCpBasicDetails,
    getCustomerByPhoneNumber,
    getCustomerById,
    createSession,
    expireSession,
    updateCPLastActivity,

    // Permissions and Valadities
    getCustomerAttributesPermission,
    updateCustomerPermissionCheck
}