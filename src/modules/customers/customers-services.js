'use strict'

const Customer                  = require('./customer-model'),
    {redis, redisKeys}          = require('../../utils/redis'),
    constants                   = require('../../utils/constants'),
    mongo                       = require('../../utils/mongo'),
    errify                      = require('../../utils/errify'),
    errMsg                      = require('../../utils/error-messages'),
    authentication              = require('../../utils/authentication'),
    sessions                    = require('../../utils/sessions'),
    logger                      = require('../../utils/logger'),
    randomNumber                = require('../../utils/random-number-generator')
                                        .generator({min: 100000, max: 999999, integer: true});

const cpExistanceCheckViaPhone  = async phoneNumber => {
    const customer              = await Customer.findOne({phoneNumber, isPhoneVerified: true, isDeleted: false}, {_id: 1}).lean()
    return customer !== null ? false : true;
}

const generatePhoneVerification = phoneNumber => {
    const OTP                   = randomNumber()
    return redis.setAsync(redisKeys.customerPhoneVerification(phoneNumber), OTP, 'EX', 5) // valid for 5 min
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
        firstName: body.firstName, lastName: body.firstName, phoneNumber: body.phoneNumber, extention: body.extention,
        roles: [constants.accessRoles.customer.customer], isPhoneVerified: true, lastActivityAt: new Date()
    }
    return mongo.createOne(Customer, customer)
}

function getCustomer(criteria, projections = {}) {
    if(Object.keys(projections).length === 0)
    projections     = {lastActivityAt: 0, __v: 0}
    const pipeline  = [{$match: criteria}, {$project: projections}]
    if(projections.businessInterests)
        pipeline.push([
            {$lookup: {from: 'businesssubtypes', localField: 'businessInterests', foreignField: '_id', as: 'businessInterests'}},
            {$addFields: {businessInterests: {$map: {input: '$businessInterests', as: 'bst', in: {
                name: '$$bst.name', businessTerm: '$$bst.businessTerm', customerTerm: '$$bst.customerTerm', imageUrl: '$$bst.imageUrl'
            }}}}}
        ])
    return mongo.aggregate(ServiceProvider, pipeline)
}

const getCustomerByPhoneNumber  = async phoneNumber => {
    const customer              = await getCustomer({phoneNumber, isPhoneVerified: true, isDeleted: false})
    return customer.length ? customer[0] : null
}

const getCustomerById           = (_id, projections) => getCustomer({_id, isDeleted: false}, projections)

const createSession             = async (userId, roles, platform, deviceToken, appVersion) => {
    const sessionId             = await sessions.createSession(userId, constants.userRoles.customer, roles, platform, deviceToken, appVersion)
    return authentication.generateToken(userId, sessionId, constants.userRoles.customer, roles, platform)
}

const expireSession             = (userId, sessionId) => sessions.expireSessionFromToken({userId, sessionId, role: constants.userRoles.customer})

const updateCPLastActivity      = _id => {
    try {
        return mongo.updateOne(Customer, {_id}, {$set: {lastActivityAt: new Date()}})
    } catch (err) {
        logger.warn({message: `Error while updating service providers lastActivityAt`, err})
    }
} 

module.exports                  = {
    cpExistanceCheckViaPhone,
    generatePhoneVerification,
    expirePhoneVerification,
    phoneVerificationCheck,
    createCustomerViaPhone,
    getCustomerByPhoneNumber,
    getCustomerById,
    createSession,
    expireSession,
    updateCPLastActivity
    // createCustomerViaPhone
}