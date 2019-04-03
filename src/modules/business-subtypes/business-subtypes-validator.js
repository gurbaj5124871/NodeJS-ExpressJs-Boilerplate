const { celebrate, Joi }    = require('celebrate'),
      mongoIdRegex          = /^[0-9a-fA-F]{24}$/;

const createBusinessSubType = celebrate({
    params                  : Joi.object().keys({
        businessType        : Joi.string().required().regex(mongoIdRegex),
    }),
    body                    : Joi.object().keys({
        //businessType        : Joi.string().required().regex(mongoIdRegex),
        name                : Joi.string().required().max(50),
        businessTerm        : Joi.string().required().max(50),
        customerTerm        : Joi.string().required().max(50),
        imageUrl            : Joi.string()
    })
})

const getAllBusinessSubTypes = celebrate({
    query                   : Joi.object().keys({
        limit               : Joi.number().integer().default(50).max(500),
        sort                : Joi.number().integer().valid([1, 2, 3]).default(1),
        // 1 = createdOn desc, 2 = createdOn asc, 3 = noOfCustomersInterested desc
        lastSubBusinessType : Joi.string().regex(mongoIdRegex)
    })
})

const getBusinessSubTypesByBusinessType = celebrate({
    params                  : Joi.object().keys({
        businessType        : Joi.string().regex(mongoIdRegex).required()
    }),
    query                   : Joi.object().keys({
        limit               : Joi.number().integer().default(50).max(500),
        lastSubBusinessType : Joi.string().regex(mongoIdRegex)
    })
})

const getBusinessSubTypeById= celebrate({
    params                  : Joi.object().keys({
        businessSubType     : Joi.string().regex(mongoIdRegex).required()
    })
})

const getBusinessSubTypesForMultipleBusinessTypes = celebrate({
    query                   : Joi.object().keys({
        businessTypes       : Joi.array().items(Joi.string().regex(mongoIdRegex)).min(1).required()
    })
})

const updateBusinessSubType = celebrate({
    params                  : Joi.object().keys({
        businessSubType     : Joi.string().regex(mongoIdRegex).required()
    }),
    body                    : Joi.object().keys({
        name                    : Joi.string().max(50),
        businessTerm            : Joi.string().max(50),
        customerTerm            : Joi.string().max(50),
        imageUrl                : Joi.string(),
        isVerified              : Joi.boolean().valid(true)
    })
})

module.exports              = {
    createBusinessSubType,
    getAllBusinessSubTypes,
    getBusinessSubTypesByBusinessType,
    getBusinessSubTypeById,
    getBusinessSubTypesForMultipleBusinessTypes,
    updateBusinessSubType
}