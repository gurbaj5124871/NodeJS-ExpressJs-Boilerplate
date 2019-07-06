'use strict'

const mongo                         = require('../../utils/mongo'),
    ServiceProvider                 = require('./service-provider-model'),
    serviceProviderServices         = require('./service-providers-services'),
    constants                       = require('../../utils/constants'),
    msInterComm                     = require('../../ms-inter-comm'),
    errify                          = require('../../utils/errify'),
    errMsg                          = require('../../utils/error-messages');

const createServiceProviderByAdmin  = async (req, res, next) => {
    try {
        const body                  = req.body;
        const serviceProvider       = (await serviceProviderServices.createServiceProvider(body)).toJSON()
        await serviceProviderServices.cacheSpBasicDetails(serviceProvider)
        await serviceProviderServices.verifyServiceProvider(serviceProvider._id, true, true)
        if(serviceProvider.email)
        serviceProvider.isEmailVerified = true
        serviceProvider.isPhoneVerified = true
        serviceProvider.isAdminVerified = true
        delete serviceProvider.password
        // create chat channel of service provider
        await msInterComm.sendSpAdminApproval(serviceProvider._id, serviceProvider.name)
        res.send(serviceProvider)
        // send mail/sms to service provider regarding their login creds
    } catch (err) {
        next(err)
    }
}

const signup                        = async (req, res, next) => {
    try {
        const body                  = req.body;
        const serviceProvider       = (await serviceProviderServices.createServiceProvider(body)).toJSON()
        await serviceProviderServices.cacheSpBasicDetails(serviceProvider)
        // await Promise.all([
        //     serviceProviderServices.sendEmailVerificationMail(serviceProvider._id, body.email),
        //     serviceProviderServices.sendPhoneVerificationOTP(serviceProvider._id, body.extention, body.phoneNumber)
        // ])
        delete serviceProvider.password
        res.send(serviceProvider)
        serviceProviderServices.updateSPLastActivity(serviceProvider._id)
    } catch (err) {
        next(err)
    }
}

const login                         = async (req, res, next) => {
    try {
        const {email, phoneNumber, password}  = req.body, {platform, deviceToken, appVersion} = req.headers;
        const serviceProvider       = await serviceProviderServices.getServiceProviderByEmailOrPhoneNumber(email, phoneNumber)
        if(!serviceProvider || !await serviceProviderServices.comparePassword(password, serviceProvider.password))        {
            const err               = email ? errify.unauthorized(errMsg['1002'], 1002) : errify.unauthorized(errMsg['1011'], 1011);
            throw err
        }
        serviceProviderServices.verificationCheckServiceProvider(serviceProvider)
        serviceProvider['authorization'] = await serviceProviderServices.createSession(serviceProvider._id, serviceProvider.roles, platform, deviceToken, appVersion)  
        delete serviceProvider.password
        res.send(serviceProvider)
        serviceProviderServices.updateSPLastActivity(serviceProvider._id)
    } catch (err) {
        next(err)
    }
}

const logout                        = async (req, res, next) => {
    try {
        const {userId, sessionId}   = req.user;
        await serviceProviderServices.expireSession(userId, sessionId)
        res.send({success: true})
        serviceProviderServices.updateSPLastActivity(userId)
    } catch (err) {
        next(err)
    }
}

const forgotPassword                = async (req, res, next) => {
    try {
        const {extention, phoneNumber} = req.body;
        const serviceProvider       = await serviceProviderServices.getServiceProviderByEmailOrPhoneNumber(undefined, phoneNumber)
        if(!serviceProvider)
            throw errify.badRequest(errMsg['1017'], 1017)
        const OTP                   = await serviceProviderServices.generatePasswordResetOTP(phoneNumber)
        // send otp to service provider
        return res.send({success: true})
    } catch (err) {
        next(err)
    }
}

const resetPassword                 = async (req, res, next) => {
    try {
        const {phoneNumber, OTP, password} = req.body;
        await serviceProviderServices.verifyPasswordResetOTP(phoneNumber, OTP)
        await serviceProviderServices.resetPassword(phoneNumber, password)
        return login(req, res, next)
    } catch (err) {
        next(err)
    }
}

const getAllServiceProviders        = async (req, res, next) => {
    try {
        const query                 = req.query, {limit, lastServiceProviderId} = query;
        let criteria                = {}
        if(query.hasOwnProperty('isAdminVerified'))
            criteria                = {isAdminVerified: query.isAdminVerified}
        if(query.hasOwnProperty('isBlocked'))
            criteria.isBlocked      = query.isBlocked
        const sort                  = (sort => {
            switch(sort)            {
                case -1              : if(lastServiceProviderId)
                                        criteria = Object.assign(criteria, {_id: {$lte: lastServiceProviderId}})
                                    return {createdOn: -1}
                case 1              : if(lastServiceProviderId)
                                        criteria = Object.assign(criteria, {_id: {$gte: lastServiceProviderId}})
                                    return {createdOn: 1}
            }
        })(query.sort);
        if(query.search)
            criteria                = Object.assign(criteria, {name: {$regex: query.search, $options: 'i'}})
        const serviceProviders      = await ServiceProvider.find(criteria, {__v: 0}).limit(limit+1).sort(sort).lean()
        let next                    = 'false'
        if(serviceProviders.length  > limit) {
            next                    = `?limit=${limit}&lastServiceProviderId=${serviceProviders[serviceProviders.length-1]._id}&sort=${query.sort}`
            serviceProviders.pop()
            if(query.hasOwnProperty('isAdminVerified'))
                next                += `&isAdminVerified=${query.isAdminVerified}`
            if(query.hasOwnProperty('isBlocked'))
                next                += `&isBlocked=${query.isBlocked}`
            if(query.search)
                next                += `&search=${query.search}`
        }
        const response              = {serviceProviders, next}
        if(lastServiceProviderId    === undefined)
            response.count          = await ServiceProvider.countDocuments(criteria)
        return res.send(response)
    } catch (err) {
        next(err)
    }
}

const getServiceProviderById        = async (req, res, next) => {
    try {
        const serviceProviderId     = req.params.serviceProviderId;
        const permissions           = serviceProviderServices.getServiceProvicerAttributesPermission(req.user, serviceProviderId)
        const projections           = permissions.filter({
            email: 1, phoneNumber: 1, extention: 1, name: 1, handle: 1, imageUrl: 1, description: 1, googleLocation: 1,
            socialMediaLinks: 1, roles: 1, businessType: 1, businessSubTypes: 1, businessModelTypes: 1, ownershipType: 1,
            noOfCustomersFollowing: 1, isAdminVerified: 1, isBlocked: 1, isDeleted: 1, isEmailVerified: 1, isPhoneVerified: 1,
            lastActivityAt: 1
        })
        const serviceProvider       = await serviceProviderServices.getServiceProviderById(serviceProviderId, projections)
        const accessCondition       = serviceProvider.isAdminVerified === false && (req.user === undefined || (req.user.userId !== serviceProviderId && req.user.role !== constants.userRoles.admin))
        if(serviceProvider === null || accessCondition)
            return next(errify.badRequest(errMsg['1017'], 1017))
        return res.send(serviceProvider)
    } catch(err) {
        next(err)   
    }
}

const getServiceProviderByHandle    = async (req, res, next) => {
    try {
        const handle                = req.params.handle;
        const serviceProvider       = await ServiceProvider.findOne({handle, isDeleted: {$ne: true}}, {_id: 1}, {lean: true})
        if(serviceProvider)         {
            req.params.serviceProviderId = serviceProvider._id
            return getServiceProviderById(req, res, next)
        } else throw errify.badData(errMsg['1014'], 1014)
    } catch (err) {
        next(err)
    }
}

const updateServiceProviderById     = async (req, res, next) => {
    try {
        const serviceProviderId     = req.params.serviceProviderId;
        const body                  = req.body
        serviceProviderServices.updateServiceProviderPermissionCheck(req.user, serviceProviderId)
        const serviceProvider       = await serviceProviderServices.updateServiceProvider(serviceProviderId, body)
        if(serviceProvider)         {
            await serviceProviderServices.cacheSpBasicDetails(serviceProvider)
            res.send(serviceProvider)
            if(req.user.userId === serviceProviderId)
                serviceProviderServices.updateSPLastActivity(serviceProviderId)
        } else res.send({})
    } catch (err) {
        next(err)
    }
}

// const updateBusinessSubTypes        = async (req, res, next) => {
//     try {
//         const serviceProviderId     = req.params.serviceProvider
//         const businessSubTypes      = [...new Set(req.body.businessSubTypes)]
//         const updateType            = req.body.updateType
//         serviceProviderServices.updateServiceProviderPermissionCheck(req.user, serviceProviderId)
//         switch(updateType)          {
//             case 1                  : await serviceProviderServices.addBusinessSubTypes(businessSubTypes)
//                 break
//             case 2                  : await serviceProviderServices.replaceBusinessSubTypes(businessSubTypes)
//                 break
//         }
//         res.send({success: true})
//         if(req.user.userId === serviceProviderId)
//             serviceProviderServices.updateSPLastActivity(serviceProviderId)
//     } catch (err) {
//         next(err)
//     }
// }

module.exports                      = {
    createServiceProviderByAdmin,
    signup,
    login,
    logout,
    forgotPassword,
    resetPassword,
    getAllServiceProviders,
    getServiceProviderById,
    getServiceProviderByHandle,
    updateServiceProviderById,
    //updateBusinessSubTypes
}