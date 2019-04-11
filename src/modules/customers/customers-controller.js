const mongo                         = require('../../utils/mongo'),
    Customer                        = require('./customer-model'),
    customerServices                = require('./customers-services'),
    errify                          = require('../../utils/errify'),
    errMsg                          = require('../../utils/error-messages');

const createCustomerByAdmin         = async (req, res, next) => {
    try {

    } catch (err) {
        next(err)
    }
}

const requestLogin                  = async (req, res, next) => {
    try {
        const {phoneNumber}         = req.body;
        const exists                = await customerServices.cpExistanceCheckViaPhone(phoneNumber)
        await customerServices.generatePhoneVerification(phoneNumber)
        return res.send({exists})
    } catch (err) {
        next(err)
    }
}

const signupViaPhone                = async (req, res, next) => {
    try {
        const body                  = req.body, {phoneNumber, OTP} = body, {platform, deviceToken, appVersion} = req.headers;
        if(customerServices.phoneVerificationCheck(phoneNumber, OTP) === false)
            throw errify.badRequest(errMsg[1016], 1016)
        const customer              = (await customerServices.createCustomerViaPhone(body)).toJSON()
        await customerServices.expirePhoneVerification(phoneNumber)
        customer.authorization      = await customerServices.createSession(customer._id, customer.roles, platform, deviceToken, appVersion)
        return res.send(customer)
    } catch (err) {
        next(err)
    }
}

const loginViaPhone                 = async (req, res, next) => {
    try {
        const body                  = req.body, {phoneNumber, OTP} = body, {platform, deviceToken, appVersion} = req.headers;
        if(customerServices.phoneVerificationCheck(phoneNumber, OTP) === false)
            throw errify.badRequest(errMsg[1016], 1016)
        await customerServices.expirePhoneVerification(phoneNumber)
        const customer              = await customerServices.getCustomerByPhoneNumber(phoneNumber)
        if(!customer)
            throw errify.badRequest(errMsg['1017'], 1017)
        customer.authorization      = await customerServices.createSession(customer._id, customer.roles, platform, deviceToken, appVersion)
        res.send(customer)
        customerServices.updateCPLastActivity(customer._id)
    } catch (err) {
        next(err)
    }
}

const logout                        = async (req, res, next) => {
    try {
        const {userId, sessionId}   = req.user;
        await customerServices.expireSession(userId, sessionId)
        res.send({success: true})
        customerServices.updateCPLastActivity(userId)
    } catch (err) {
        next(err)
    }
}

module.exports                      = {
    createCustomerByAdmin,
    requestLogin,
    signupViaPhone,
    loginViaPhone,
    logout
}