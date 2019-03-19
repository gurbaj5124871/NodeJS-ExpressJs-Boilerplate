const mongo                     = require('../../utils/mongo'),
    constants                   = require('../../utils/constants'),
    errify                      = require('../../utils/errify'),
    errMsg                      = require('../../utils/error-messages'),
    BusinessTypes               = require('./business-types-model'),
    businessTypesServices       = require('./business-types-services');

const createBusinessType        = async (req, res, next) => {
    try {
        let businessType        = req.body;
        if(req.user.roles.includes(constants.roles.admin))
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
        const includeUnverified = req.user && req.user.roles.includes(constants.roles.admin) ? req.query.includeUnverified : false;
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
        return res.send({success: true})
    } catch (err) {
        next(err)
    }
}

const getBusinessTypeById       = async (req, res, next) => {
    try {
        const criteria          = {_id: req.params._id}
        if(req.user.roles.includes(constants.roles.admin))
        criteria['isVerified']  = true
        const businessType      = await mongo.findOne(BusinessTypes, criteria, {__v: 0}, {lean: true})
        return res.send(businessType || {})
    } catch (err) {
        next(err)
    }
}

module.exports                  = {
    createBusinessType,
    getBusinessTypes,
    updateBusinessType,
    getBusinessTypeById
}