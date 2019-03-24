const mongo                         = require('../../utils/mongo'),
    serviceProviderServices         = require('./service-providers-services'),
    authentication                  = require('../../utils/authentication'),
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
        // await Promise.all([
        //     serviceProviderServices.sendEmailVerificationMail(serviceProvider._id, body.email),
        //     serviceProviderServices.sendPhoneVerificationOTP(serviceProvider._id, body.extention, body.phoneNumber)
        // ])
        delete serviceProvider.password
        return res.send(serviceProvider)
    } catch (err) {
        next(err)
    }
}

module.exports                      = {
    createServiceProviderByAdmin,
    signup
}