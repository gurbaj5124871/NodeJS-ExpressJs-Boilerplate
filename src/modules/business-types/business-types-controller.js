const mongo                     = require('../../utils/mongo'),
    constants                   = require('../../utils/constants'),
    errify                      = require('../../utils/errify'),
    errMsg                      = require('../../utils/error-messages'),
    BusinessTypes               = require('./business-types-model'),
    BusinessTypesServices       = require('./business-types-services');

const createBusinessType        = async (req, res, next) => {
    try {
        let businessType        = req.body;
        if(req.user.roles.includes(constants.roles.admin))
        businessType.isVerified = true
        else businessType.order = undefined
        businessType.order      = await BusinessTypesServices.getOrderForBusinessType(businessType.order)
        businessType            = await BusinessTypesServices.createBusinessType(businessType)
        return res.send(businessType)
    } catch (err) {
        next(err)
    }
}

const getBusinessTypes          = async (req, res, next) => {
    try {
        return res.send({success: true})
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
        return res.send({success: true})
    } catch (err) {
        next(err)
    }
}

module.exports                  = {
    createBusinessType,
    getBusinessTypes,
    updateBusinessType
}