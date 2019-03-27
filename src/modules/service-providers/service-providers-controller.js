const mongo                         = require('../../utils/mongo'),
    ServiceProvider                 = require('./service-provider-model'),
    serviceProviderServices         = require('./service-providers-services'),
    errify                          = require('../../utils/errify'),
    errMsg                          = require('../../utils/error-messages');

const createServiceProviderByAdmin  = async (req, res, next) => {
    try {
        const body                  = req.body;
        const serviceProvider       = await serviceProviderServices.createServiceProvider(body)
        await serviceProviderServices.verifyServiceProvider(serviceProvider._id, true, true)
        serviceProvider.isEmailVerified = true
        serviceProvider.isPhoneVerified = true
        serviceProvider.isAdminVerified = true
        delete serviceProvider.password
        res.send(serviceProvider)
        // send mail to service provider regarding their login creds
    } catch (err) {
        next(err)
    }
}

const signup                        = async (req, res, next) => {
    try {
        const body                  = req.body;
        const serviceProvider       = await serviceProviderServices.createServiceProvider(body)        
        await Promise.all([
            serviceProviderServices.sendEmailVerificationMail(serviceProvider._id, body.email),
            serviceProviderServices.sendPhoneVerificationOTP(serviceProvider._id, body.extention, body.phoneNumber)
        ])
        delete serviceProvider.password
        res.send(serviceProvider)
        serviceProvider.updateSPLastActivity(userId)
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

module.exports                      = {
    createServiceProviderByAdmin,
    signup,
    login,
    logout
}