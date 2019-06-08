'use strict'

const mongo                     = require('../../utils/mongo'),
    constants                   = require('../../utils/constants'),
    errify                      = require('../../utils/errify'),
    errMsg                      = require('../../utils/error-messages'),
    businessTypesServices       = require('../business-types/business-types-services'),
    businessSubTypesServices    = require('./business-subtypes-services'),
    BusinessSubTypes            = require('./business-subtypes-model');

const createBusinessSubType     = async (req, res, next) => {
    try {
        const body              = req.body;
        if(! await businessTypesServices.getBusinessTypeById(req.params.businessType))
            throw errify.badRequest(errMsg['1008'], 1008)
        const businessSubType   = await mongo.createOne(BusinessSubTypes, Object.assign(body, req.params))
        res.send(businessSubType)
    } catch (err) {
        next(err)
    }
}

const getBusinessSubTypesByBusinessType = async (req, res, next) => {
    try {
        const businessType      = req.params.businessType, {limit, lastSubBusinessType} = req.query;
        const businessSubTypes  = await businessSubTypesServices.getBusinessSubTypesByBusinessType(businessType, limit+1, lastSubBusinessType)
        let next                = 'false'
        if(businessSubTypes.length > limit) {
            businessSubTypes.pop()
            next                = `?lastSubBusinessType=${businessSubTypes[businessSubTypes.length-1]._id}`
        }
        return res.send({businessSubTypes, next})
    } catch (err) {
        next(err)
    }
}

const getAllBusinessSubTypes    = async (req, res, next) => {
    try {
        const {limit, lastSubBusinessType, sortingOptions} = req.query
        const businessSubTypes  = await businessSubTypesServices.getAllBusinessSubTypes(sortingOptions, limit+1, lastSubBusinessType)
        let next                = 'false'
        if(businessSubTypes.length > limit) {
            businessSubTypes.pop()
            next                = `?lastSubBusinessType=${businessSubTypes[businessSubTypes.length-1]._id}&sort=${sortingOptions||1}`
        }
        return res.send({businessSubTypes, next})
    } catch (err) {
        next(err)
    }
}

const getBusinessSubTypeById    = async (req, res, next) => {
    try {
        const businessSubTypeId = req.params.businessSubType
        const isVerified        = req.user && req.user.roles.includes(constants.userRoles.admin) ? undefined : true;
        const businessSubType   = await businessSubTypesServices.getBusinessSubTypeById(businessSubTypeId, isVerified)
        return res.send(businessSubType || {})
    } catch (err) {
        next(err)
    }
}

const getBusinessSubTypesForMultipleBusinessTypes = async (req, res, next) => {
    try {
        const businessTypes     = req.query.businessTypes
        const businessSubTypes  = await businessSubTypesServices.getBusinessSubTypesForMultipleBusinessTypes(businessTypes)
        return releaseEvents.send(businessSubTypes)
    } catch (err) {
        next(err)
    }
}

const updateBusinessSubType     = async (req, res, next) => {
    try {
        const businessSubTypeId = req.params.businessSubType, body = req.body;
        const businessSubType   = await mongo.findOneAndUpdate(BusinessSubTypes, {_id: businessSubTypeId}, {$set: body}, {lean: true})
        res.send(businessSubType || {})
    } catch (err) {
        next(err)
    }
}

module.exports                  = {
    createBusinessSubType,
    getAllBusinessSubTypes,
    getBusinessSubTypesByBusinessType,
    getBusinessSubTypeById,
    getBusinessSubTypesForMultipleBusinessTypes,
    updateBusinessSubType
}