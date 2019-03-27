const { celebrate, Joi }    = require('celebrate'),
      mongoIdRegex          = /^[0-9a-fA-F]{24}$/;

const createBusinessType    = celebrate({
    body                    : Joi.object().keys({
        name                : Joi.string().required().max(50),
        businessTerm        : Joi.string().required().max(50),
        customerTerm        : Joi.string().required().max(50),
        order               : Joi.number().integer().min(1),
        imageUrl            : Joi.string()
    })
})

const getBusinessTypes      = celebrate({
    query                   : Joi.object().keys({
        limit               : Joi.number().integer().default(50),
        order               : Joi.number().integer(),
        includeUnverified   : Joi.boolean().default(false)
    })
})

const updateBusinessType    = celebrate({
    params                  : Joi.object().keys({
        businessType        : Joi.string().required().regex(mongoIdRegex)
    }),
    body                    : Joi.object().keys({
        name                : Joi.string().max(50),
        businessTerm        : Joi.string().max(50),
        customerTerm        : Joi.string().max(50),
        isVerified          : Joi.boolean().valid(true),
        order               : Joi.number().integer().min(1),
        imageUrl            : Joi.string()
    }).or('name', 'businessTerm', 'customerTerm')
})

const getBusinessTypeById   = celebrate({
    params                  : Joi.object().keys({
        businessType        : Joi.string().required().regex(mongoIdRegex)
    })
})

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