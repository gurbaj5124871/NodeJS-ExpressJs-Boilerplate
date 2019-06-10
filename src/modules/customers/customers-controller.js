'use strict'

const mongo                         = require('../../utils/mongo'),
    Customer                        = require('./customer-model'),
    CustomerMqtt                    = require('./customer-mqtt-model'),
    customerServices                = require('./customers-services'),
    constants                       = require('../../utils/constants'),
    errify                          = require('../../utils/errify'),
    errMsg                          = require('../../utils/error-messages');

const createCustomerByAdmin         = async (req, res, next) => {
    try {
        const body                  = req.body
        const customer              = (await customerServices.createCustomerViaPhone(body)).toJSON()
        await customerServices.cacheCpBasicDetails(customer)
        return res.send(customer)
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
        await customerServices.cacheCpBasicDetails(customer)
        await customerServices.expirePhoneVerification(phoneNumber)
        customer.authorization      = await customerServices.createSession(customer._id, customer.roles, platform, deviceToken, appVersion)
        return res.send(customer)
    } catch (err) {
        next(err)
    }
}

const completeProfile               = async (req, res, next) => {
    try {
        const customerId            = req.params.customerId, body = Object.assign(req.body, {isSignupComplete: true})
        customerServices.updateCustomerPermissionCheck(req.user, customerId)
        const criteria              = {_id: customerId, isSignupComplete: {$ne: true}}
        const options               = {lean: true, new: true, useFindAndModify: false, projection: {
            __v: 0, isDeleted: 0, lastActivityAt: 0, createdAt: 0, updatedAt: 0
        }}
        const customer              = await Customer.findOneAndUpdate(criteria, {$set: body}, options)
        if(customer)                {
            await customerServices.cacheCpBasicDetails(customer)
            res.send(customer)
            if(req.user.userId === customerId)
                customerServices.updateCPLastActivity(customerId)
        } else return res.send({})
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
        customerServices.verificationCheckCustomer(customer)
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

const getAllCustomers               = async (req, res, next) => {
    try {
        const query                 = req.query, {limit, lastCustomerId} = query;
        let criteria                = {}
        if(query.hasOwnProperty('isSignupComplete'))
            criteria                = {isSignupComplete: query.isSignupComplete}
        if(query.hasOwnProperty('isBlocked'))
            criteria.isBlocked      = query.isBlocked
        const sort                  = (sort => {
            switch(sort)            {
                case -1             : if(lastCustomerId)
                                        criteria = Object.assign(criteria, {_id: {$lte: lastCustomerId}})
                                    return {createdAt: -1}
                case 1              : if(lastCustomerId)
                                        criteria = Object.assign(criteria, {_id: {$gte: lastCustomerId}})
                                    return {createdAt: 1}
            }
        })(query.sort);
        if(query.search)
            criteria                = Object.assign(criteria, {$or: [
                {firstName: {$regex: query.search, $options: 'i'}}, {lastName: {$regex: query.search, $options: 'i'}}
            ]})
        const customers             = await Customer.find(criteria, {__v: 0}).sort(sort).limit(limit+1).lean()
        let next                    = 'false'
        if(customers.length > limit) {
            next                    = `?limit=${limit}&lastCustomerId=${customers[customers.length-1]._id}&sort=${query.sort}`
            customers.pop()
            if(query.hasOwnProperty('isSignupComplete'))
                next                += `&isSignupComplete=${query.isSignupComplete}`
            if(query.hasOwnProperty('isBlocked'))
                next                += `&isBlocked=${query.isBlocked}`
            if(query.search)
                next                += `&search=${query.search}`
        }
        const response              = {customers, next}
        if(lastCustomerId           === undefined)
            response.count          = await Customer.countDocuments(criteria)
        return res.send(response)
    } catch (err) {
        next(err)
    }
}

const getCustomerById               = async (req, res, next) => {
    try {
        const permissions           = customerServices.getCustomerAttributesPermission(req.user, req.params.customerId)
        const projections           = permissions.filter({
            email: 1, phoneNumber: 1, extention: 1, firstName: 1, lastName: 1, imageUrl: 1, bio: 1, gender: 1, dob: 1,
            socialMediaLinks: 1, googleLocation: 1, roles: 1, noOfBusinessesFollowed: 1, isSignupComplete: 1,
            isBlocked: 1, isDeleted: 1, isEmailVerified: 1, isPhoneVerified: 1, lastActivityAt: 1
        })
        const customer              = await customerServices.getCustomerById(req.params.customerId, projections)
        if(customer === null || (req.user.userId !== req.params.customerId && req.user.role !== constants.userRoles.admin && !customer.isSignupComplete))
            return next(errify.badRequest(errMsg['1017'], 1017))
        else return res.send(customer)
    } catch (err) {
        next(err)
    }
}

const updateCustomerById            = async (req, res, next) => {
    try {
        const customerId            = req.params.customerId, body = req.body;
        customerServices.updateCustomerPermissionCheck(req.user, customerId)
        const customer              = await customerServices.updateCustomer(customerId, body)
        if(customer)                {
            await customerServices.cacheCpBasicDetails(customer)
            res.send(customer)
            if(customer && req.user.userId === customerId)
                customerServices.updateCPLastActivity(customerId)
        } else return res.send({})
    } catch (err) {
        next(err)
    }
}

module.exports                      = {
    createCustomerByAdmin,
    requestLogin,
    signupViaPhone,
    completeProfile,
    loginViaPhone,
    logout,
    getAllCustomers,
    getCustomerById,
    updateCustomerById
}