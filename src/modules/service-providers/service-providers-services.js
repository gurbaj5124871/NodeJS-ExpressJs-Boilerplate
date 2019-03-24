const ServiceProvider               = require('./service-provider-model'),
    businessTypesServices           = require('../business-types/business-types-services'),
    bcrypt                          = require('../../utils/bcrypt'),
    constants                       = require('../../utils/constants'),
    universalFunc                   = require('../../utils/universal-functions'),
    errify                          = require('../../utils/errify'),
    errMsg                          = require('../../utils/error-messages'),
    mongo                           = require('../../utils/mongo');

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

const verifyServiceProvider         = (spId, isEmailVerified = false, isPhoneVerified = false) => {
    let dataToUpdate                = {isAdminVerified: true}
    if(isEmailVerified)
        dataToUpdate                = Object.assign(dataToUpdate, {isEmailVerified})
    if(isPhoneVerified)
        dataToUpdate                = Object.assign(dataToUpdate, {isPhoneVerified})
    return ServiceProvider.updateOne({_id: spId}, {$set: dataToUpdate})
}

const sendEmailVerificationMail     = (spId, email) => {

}

const sendPhoneVerificationOTP      = (spId, extention, phoneNumber) => {
    
}

// const updateServiceProvider         = async body => {

// }

module.exports = {
    serviceProviderExistanceCheck,
    createServiceProvider,
    verifyServiceProvider,
    sendEmailVerificationMail,
    sendPhoneVerificationOTP
}