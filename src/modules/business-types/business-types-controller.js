const mongo                     = require('../../utils/mongo'),
    constants                   = require('../../utils/constants'),
    errify                      = require('../../utils/errify'),
    errMsg                      = require('../../utils/error-messages'),
    BusinessTypes               = require('./business-types-model'),
    businessTypesServices       = require('./business-types-services'),
    BusinessSubTypes            = require('./business-subtypes-model');

const createBusinessType        = async (req, res, next) => {
    try {
        let businessType        = req.body;
        if(req.user.roles.includes(constants.userRoles.admin))
        businessType.isVerified = true
        else businessType.order = undefined
        businessType.order      = await businessTypesServices.getOrderForBusinessType(businessType.order)
        businessType            = await businessTypesServices.createBusinessType(businessType)
        return res.send(businessType)
    } catch (err) {
        next(err)
    }
}

const getBusinessTypes          = async (req, res, next) => {
    try {
        const {limit, order}    = req.query;
        const includeUnverified = req.user && req.user.roles.includes(constants.userRoles.admin) ? req.query.includeUnverified : false;
        const businessTypes     = await (async includeUnverified => {
            switch(true){
                case includeUnverified === false: return businessTypesServices.getBusinessTypes(includeUnverified, limit, order)
                default         : return businessTypesServices.getBusinessTypesCache(limit, order)
            }
        })(includeUnverified);
        const response          = businessTypesServices.paginateBusinessTypes(businessTypes, limit)
        if(order === undefined) 
            response['count']   = await businessTypesServices.getBusinessTypesCount(includeUnverified)
        return res.send(response)
    } catch (err) {
        next(err)
    }
}

const updateBusinessType        = async (req, res, next) => {
    try {
        const businessTypeId    = req.params.businessType, body = req.body;
        if(body.order)
            await businessTypesServices.getOrderForBusinessType(body.order)
        const businessType      = await mongo.findOneAndUpdate(BusinessTypes, {_id: businessTypeId}, body, {lean: true, lean: true}) // dont pass new true as arg
        if(businessType && businessType.isVerified) {
            const update = await businessTypesServices.removeBusinessTypeFromCache(businessType.order)
            if(update === 1)
            await businessTypesServices.addBusinessTypeToCache(businessType, businessType.order)
        }
        return res.send({success: true})
    } catch (err) {
        next(err)
    }
}

const getBusinessTypeById       = async (req, res, next) => {
    try {
        const criteria          = {_id: req.params.businessType}
        if(!req.user.roles.includes(constants.userRoles.admin))
        criteria['isVerified']  = true
        const businessType      = await mongo.findOne(BusinessTypes, criteria, {__v: 0}, {lean: true})
        return res.send(businessType || {})
    } catch (err) {
        next(err)
    }
}

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
        const criteria          = {businessType}
        if(lastSubBusinessType)
            criteria['_id']     = {$gt: lastSubBusinessType}
        // sorting logic to be updated
        const businessSubTypes  = await BusinessSubTypes.find(criteria, {__v: 0}).limit(limit+1).sort({_id: 1}).lean()
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
        const criteria          = {}
        if(lastSubBusinessType)
            criteria['_id']     = {$gt: lastSubBusinessType}
        const sort              = (sortingOptions => {
            switch(sortingOptions){
                case 2          : return {createdOn: 1}
                case 3          : return {noOfCustomersInterested: -1}
                default         : return {createdOn: -1}
            }
        })(sortingOptions);
        const businessSubTypes  = await BusinessSubTypes.aggregate([
            {$match : criteria}, {$sort: sort}, {$limit: limit+1},
            {$lookup: {from: 'businesstypes', localField: 'businessType', foreignField: '_id', as: 'businessType'}},
            {$unwind: '$businessType'},
            {$project: {
                name: 1, businessTerm: 1, customerTerm: 1, imageUrl: 1, isVerified: 1, noOfCustomersInterested: 1,
                businessType: {
                    _id: '$businessType._id', name: '$businessType.name', businessTerm: '$businessType.businessTerm',
                    customerTerm: '$businessType.customerTerm', imageUrl: '$businessType.imageUrl',
                    isVerified: '$businessType.isVerified'
                }
            }}
        ])
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

const getBusinessSubTypeById    = async (req, res, next) => {
    try {
        const criteria          = {_id: req.params.businessSubType}
        if(!req.user.roles.includes(constants.userRoles.admin))
        criteria['isVerified']  = true
        const businessSubType   = await mongo.findOne(BusinessSubTypes, criteria, {__v: 0}, {lean: true})
        return res.send(businessSubType || {})
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
    createBusinessType,
    getBusinessTypes,
    updateBusinessType,
    getBusinessTypeById,
    createBusinessSubType,
    getAllBusinessSubTypes,
    getBusinessSubTypesByBusinessType,
    getBusinessSubTypeById,
    updateBusinessSubType
}