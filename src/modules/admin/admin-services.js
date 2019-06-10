'use strict'

const mongo                 = require('../../utils/mongo'),
    Admin                   = require('./admin-model'),
    ServiceProvider         = require('../service-providers/service-provider-model'),
    Customer                = require('../customers/customer-model');

const verifyServiceProvider = async serviceProviderId => {
    const criteria          = {_id: serviceProviderId, isAdminVerified: {$ne: true}, isDeleted: {$ne: true}}
    const dataToUpdate      = {$set: {isAdminVerified: true, isPhoneVerified: true}}
    const updateResponse    = await ServiceProvider.updateOne(criteria, dataToUpdate)
    if(updateResponse.nModified === 1) {
        // send sms and notificaiton to the service provider regarding account verification
    }
    return true
}

const changeSpBlockStatus   = async (serviceProviderId, isBlocked) => {
    const criteria          = {_id: serviceProviderId, isDeleted: {$ne: true}}
    const updateResponse    = await ServiceProvider.updateOne(criteria, {$set: {isBlocked}})
    if(updateResponse.nModified === 1) {
        // send sms to the service provider regarding block status
    }
    return true
}

const deleteServiceProvider = async serviceProviderId => {
    const criteria          = {_id: serviceProviderId, isDeleted: {$ne: true}}
    const updateResponse    = await ServiceProvider.updateOne(criteria, {$set: {isDeleted: true}})
    if(updateResponse.nModified === 1) {
        // send sms to the service provider regarding deletion of account
    }
    return true
}

const changeCpBlockStatus   = async (customerId, isBlocked) => {
    const criteria          = {_id: customerId, isDeleted: {$ne: true}}
    const updateResponse    = await Customer.updateOne(criteria, {$set: {isBlocked}})
    if(updateResponse.nModified === 1) {
        // send sms to the customer regarding block status
    }
    return true
}

const deleteCustomer        = async customerId => {
    const criteria          = {_id: customerId, isDeleted: {$ne: true}}
    const updateResponse    = await Customer.updateOne(criteria, {$set: {isDeleted: true}})
    if(updateResponse.nModified === 1) {
        // send sms to the scustomer regarding deletion of account
    }
    return true
}

module.exports              = {
    verifyServiceProvider,
    changeSpBlockStatus,
    deleteServiceProvider,
    changeCpBlockStatus,
    deleteCustomer
}