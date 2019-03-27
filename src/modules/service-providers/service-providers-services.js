const ServiceProvider               = require('./service-provider-model'),
    businessTypesServices           = require('../business-types/business-types-services'),
    bcrypt                          = require('../../utils/bcrypt'),
    logger                          = require('../../utils/logger'),
    constants                       = require('../../utils/constants'),
    universalFunc                   = require('../../utils/universal-functions'),
    errify                          = require('../../utils/errify'),
    errMsg                          = require('../../utils/error-messages'),
    mongo                           = require('../../utils/mongo'),
    authentication                  = require('../../utils/authentication'),
    sessions                        = require('../../utils/sessions'),
    randomNumber                    = require('../../utils/random-number-generator')
                                        .generator({min: 100000, max: 999999, integer: true});

const serviceProviderExistanceCheck = async (email, phoneNumber, isEmailVerified = true, isPhoneVerified = true) => {
    const criteria                  = {$or: [{email}, {phoneNumber}]}
    if(isEmailVerified)
        criteria.$or[0].isEmailVerified = isEmailVerified
    if(isPhoneVerified)
        criteria.$or[0].isPhoneVerified = isPhoneVerified
    const sp = await ServiceProvider.findOne(criteria, {email: 1, phoneNumber: 1, extention: 1, isEmailVerified: 1, isPhoneVerified: 1}, {lean: true})
    if(sp)
        return {userExists: true, user: sp}
    else return {userExists: false, user: undefined}
}

const createServiceProvider         = async sp => {
    if(! await businessTypesServices.getBusinessTypeById(sp.businessType))
            throw errify.badRequest(errMsg['1008'], 1008)
    const spExistanceCheck          = await serviceProviderExistanceCheck(sp.email, sp.phoneNumber)
    if(spExistanceCheck.userExists)
        throw errify.conflict(errMsg['1009'], 1009)
    const serviceProvider           = {
        _id: mongo.getObjectId(), email: sp.email, phoneNumber: sp.phoneNumber, extention: sp.extention, name: sp.name,
        googleLocation: sp.googleLocation, businessType: sp.businessType, businessModelTypes: sp.businessModelTypes,
        ownershipType: sp.ownershipType, roles: [constants.accessRoles.serviceProvider.serviceProvider],
        password: await bcrypt.hashPassword(sp.password)
    }
    serviceProvider['handle']       = await getNewHandle(serviceProvider.name, undefined, serviceProvider._id.toHexString())
    if(sp.imageUrl)
        serviceProvider['imageUrl'] = sp.imageUrl
    if(sp.description)
        serviceProvider['description'] = sp.description
    
    return mongo.createOne(ServiceProvider, serviceProvider)
}

const getNewHandle                  = async (firstName, lastName, userId) => {
    firstName                       = universalFunc.convertToAlphaNumeric(firstName.toLowerCase())
    if (lastName !== undefined) 
        lastName                    = universalFunc.convertToAlphaNumeric(lastName.toLowerCase())
    const handleToSearch            = lastName !== undefined ? firstName + lastName : firstName;
    if (handleToSearch.length       <= 3 || constants.reservedHandles.includes(handleToSearch))
        return userId;
    const criteria                  = {handle: new RegExp('^' + handleToSearch + '[0-9]*$')}
    const handles                   = await ServiceProvider.find(criteria, {_id: 0, handle: 1}).lean()
    const handleSuffixCounters      = handles.map(sp => {
        const counter = parseInt(sp.handle.replace(handleToSearch, ''))
        return isNaN(counter) ? 0 : counter
    })
    return handleToSearch + getFreeNumber(handleSuffixCounters)

    function getFreeNumber(numbers) {
        numbers.sort()
        for (let i = 0; i < numbers.length; i+=1) {
            if (numbers[i] !== i)
                return i === 0 ? '' : i
        }
        return numbers.length === 0 ? '' : numbers.length
    }
}

function getServiceProvider(criteria){
    const projections               = {lastActivityAt: 0, emailVerificationToken: 0, phoneVerificationToken: 0}
    return mongo.findOne(ServiceProvider, criteria, projections, {lean: true})
}

const getServiceProviderByEmailOrPhoneNumber = (email, phoneNumber) => {
    const criteria                  = email ? {email} : {phoneNumber};
    return getServiceProvider(criteria)
}

const getServiceProviderById        = _id => getServiceProvider({_id})

const verificationCheckServiceProvider = sp => {
    if(sp.isEmailVerified === false && sp.isPhoneVerified === false)
        throw errify.unauthorized(errMsg['1007'], 1007)
    if(sp.isEmailVerified === false)
        throw errify.unauthorized(errMsg['1005'], 1005)
    if(sp.isPhoneVerified === false)
        throw errify.unauthorized(errMsg['1006'], 1006)
    if(sp.isAdminVerified === false)
        throw errify.unauthorized(errMsg['1012'], 1012)
    if(sp.isBloecked === false)
        throw errify.unauthorized(errMsg['1013'], 1013)
}

const verifyServiceProvider         = (spId, isEmailVerified = false, isPhoneVerified = false) => {
    let dataToUpdate                = {isAdminVerified: true}
    if(isEmailVerified)
        dataToUpdate                = Object.assign(dataToUpdate, {isEmailVerified})
    if(isPhoneVerified)
        dataToUpdate                = Object.assign(dataToUpdate, {isPhoneVerified})
    return ServiceProvider.updateOne({_id: spId}, {$set: dataToUpdate})
}

const sendEmailVerificationMail     = async (spId, email) => {
    try {
        const emailVerificationToken= randomNumber()
        const update = await mongo.updateOne(ServiceProvider, {_id: spId, email, isEmailVerified: false}, {$set: {emailVerificationToken}})
        // send email to the service provider
    } catch (err) {
        logger.warn({message: `Error while sending verification mail to ${email}`, err})
    }
}

const sendPhoneVerificationOTP      = async (spId, extention, phoneNumber) => {
    try {
        const phoneVerificationToken= randomNumber()
        const update = await mongo.updateOne(ServiceProvider, {_id: spId, phoneNumber, isEmailVerified: false}, {$set: {phoneVerificationToken}})
        // send sms to the service provider
    } catch (err) {
        logger.warn({message: `Error while sending verification sms to ${phoneNumber}`, err})
    }
}

const comparePassword               = (inputPass, dbPass) => bcrypt.comparePassword(inputPass, dbPass)

const createSession                 = async (userId, roles, platform, deviceToken, appVersion) => {
    const sessionId                 = await sessions.createSession(userId, constants.userRoles.serviceProvider, roles, platform, deviceToken, appVersion)
    return authentication.generateToken(userId, sessionId, constants.userRoles.serviceProvider, roles, platform)
}

const expireSession                 = (userId, sessionId) => sessions.expireSessionFromToken({userId, sessionId, role: constants.userRoles.serviceProvider})

const updateSPLastActivity          = _id => {
    try {
        return mongo.updateOne(ServiceProvider, {_id}, {$set: {lastActivityAt: new Date()}})
    } catch (err) {
        logger.warn({message: `Error while updating service providers lastActivityAt`, err})
    }
}

module.exports = {
    serviceProviderExistanceCheck,
    createServiceProvider,
    getServiceProviderByEmailOrPhoneNumber,
    getServiceProviderById,
    verificationCheckServiceProvider,
    verifyServiceProvider,
    sendEmailVerificationMail,
    sendPhoneVerificationOTP,
    comparePassword,
    createSession,
    expireSession,
    updateSPLastActivity
}