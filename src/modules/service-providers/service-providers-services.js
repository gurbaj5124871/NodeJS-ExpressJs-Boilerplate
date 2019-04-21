const ServiceProvider               = require('./service-provider-model'),
    businessTypesServices           = require('../business-types/business-types-services'),
    businessSubTypesServices        = require('../business-subtypes/business-subtypes-services'),
    bcrypt                          = require('../../utils/bcrypt'),
    logger                          = require('../../utils/logger'),
    constants                       = require('../../utils/constants'),
    universalFunc                   = require('../../utils/universal-functions'),
    errify                          = require('../../utils/errify'),
    errMsg                          = require('../../utils/error-messages'),
    mongo                           = require('../../utils/mongo'),
    authentication                  = require('../../utils/authentication'),
    sessions                        = require('../../utils/sessions'),
    accessControl                   = require('../../utils/authorization').accessControl,
    resource                        = constants.resource,
    randomNumber                    = require('../../utils/random-number-generator')
                                        .generator({min: 100000, max: 999999, integer: true});

const serviceProviderExistanceCheck = async (email, phoneNumber, isEmailVerified = false, isPhoneVerified = false) => {
    const criteria                  = {$or: [/*{email}, {phoneNumber}*/]}
    if(email)                       {
        const match                 = {email}
        if(isEmailVerified)
            match.isEmailVerified   = isEmailVerified
        criteria.$or.push(match)
    }
    if(phoneNumber)                 {
        const match                 = {phoneNumber}
        if(isPhoneVerified)
            match.isPhoneVerified   = isPhoneVerified
        criteria.$or.push(match)
    }
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
        googleLocation: [sp.googleLocation], businessType: sp.businessType, businessModelTypes: sp.businessModelTypes,
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

async function handleExistanceCheck(handle) {
    if(await ServiceProvider.findOne({handle}, {_id: 1}))
        return true
    else return false
}

function getServiceProvider(criteria, projections = {}) {
    if(Object.keys(projections).length === 0)
    projections     = {lastActivityAt: 0, emailVerificationToken: 0, phoneVerificationToken: 0, __v: 0}
    const pipeline  = [{$match: criteria}, {$project: projections}]
    if(projections.businessType)
        pipeline.push([
            {$lookup: {from: 'businesstypes', localField: 'businessType', foreignField: '_id', as: 'businessType'}},
            {$unwind: '$businessType'},
            {$addFields: {businessType: {
                name: '$businessType.name', businessTerm: '$businessType.businessTerm',
                customerTerm: '$businessType.customerTerm', imageUrl: '$businessType.imageUrl'
            }}}
        ])
    if(projections.businessSubTypes)
        pipeline.push([
            {$lookup: {from: 'businesssubtypes', localField: 'businessSubTypes', foreignField: '_id', as: 'businesssubtypes'}},
            {$addFields: {businessSubTypes: {$map: {input: '$businessSubTypes', as: 'bst', in: {
                name: '$$bst.name', businessTerm: '$$bst.businessTerm', customerTerm: '$$bst.customerTerm', imageUrl: '$$bst.imageUrl'
            }}}}}
        ])
    return mongo.aggregate(ServiceProvider, pipeline)
}

const getServiceProviderByEmailOrPhoneNumber = async (email, phoneNumber) => {
    const criteria                  = email ? {email} : {phoneNumber};
    const serviceProvider           = await getServiceProvider(criteria)
    return serviceProvider.length ? serviceProvider[0] : null
}

const getServiceProviderById        = async (_id, projections) => {
    const serviceProvider           = await getServiceProvider({_id, isDeleted: false}, projections)
    return serviceProvider.length ? serviceProvider[0] : null
}

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

const updateServiceProvider         = async (spId , data) => {
    if(data.businessType || data.businessModelTypes || data.ownershipType) {
        data.isAdminVerified        = false
        if(data.businessType)       {
            if(! await businessTypesServices.getBusinessTypeById(data.businessType))
                throw errify.badRequest(errMsg['1008'], 1008)
        }
    }
    if(data.handle) {
        if(constants.reservedHandles.includes(data.handle))
            throw errify.badData(errMsg['1015'], 1015)
        if(handleExistanceCheck(data.handle))
            throw errify.badData(errMsg['1015'], 1015)
    }
    return ServiceProvider.findOneAndUpdate({_id: spId}, {$set: data}, {lean: true, new: true})
}

const addBusinessSubTypes           = async (spId, businessSubTypes) => {
    businessSubTypes                = (await businessSubTypesServices.getMultipleBusinessSubTypes(businessSubTypes, true, {_id: 1}))
                                        .map(obj => obj._id);
    if(businessSubTypes.length)
        return ServiceProvider.updateOne({_id: spId}, {$addToSet: {businessSubTypes}})
}

const replaceBusinessSubTypes       = async (spId, businessSubTypes) => {
    businessSubTypes                = (await businessSubTypesServices.getMultipleBusinessSubTypes(businessSubTypes, true, {_id: 1}))
                                        .map(obj => obj._id);
    if(businessSubTypes.length)
        return ServiceProvider.updateOne({_id: spId}, {$set: {businessSubTypes}})
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

/**************************** PERMISSIONS and VALIDITY ***********************************/

const getServiceProvicerAttributesPermission = (requestSP, spId) => {
    if (requestSP === undefined) {
        const openProfile = accessControl.can(constants.userRoles.customer).readAny(resource.serviceProvider)
        openProfile._.attributes.push('!phoneNumber', '!extention', '!email')
        return openProfile
    }
    else if (requestSP.userId === spId)
        return accessControl.can(requestSP.roles).readOwn(resource.serviceProvider)
    else
        return accessControl.can(requestSP.roles).readAny(resource.serviceProvider)
}

const updateServiceProviderPermissionCheck = (requestUser, spId) => {
    if(accessControl.can(requestUser.roles).updadeAny(resource.serviceProvider))
        return true
    if(requestUser.userId !== spId)
        throw errify.badRequest()
}

module.exports = {
    serviceProviderExistanceCheck,
    createServiceProvider,
    getServiceProviderByEmailOrPhoneNumber,
    getServiceProviderById,
    verificationCheckServiceProvider,
    verifyServiceProvider,
    updateServiceProvider,
    replaceBusinessSubTypes,
    addBusinessSubTypes,
    sendEmailVerificationMail,
    sendPhoneVerificationOTP,
    comparePassword,
    createSession,
    expireSession,
    updateSPLastActivity,

    // Permissions and Valadities
    getServiceProvicerAttributesPermission,
    updateServiceProviderPermissionCheck
}