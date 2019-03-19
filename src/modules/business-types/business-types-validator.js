const { celebrate, Joi }    = require('celebrate'),
      mongoIdRegex          = /^[0-9a-fA-F]{24}$/;


const createBusinessType    = celebrate({
    body                    : Joi.object().keys({
        name                : Joi.string().required().max(50),
        businessTerm        : Joi.string().required().max(50),
        customerTerm        : Joi.string().required().max(50),
        order               : Joi.number().integer().min(1)
    })
})

const getBusinessTypes      = celebrate({
    query                   : Joi.object().keys({
        limit               : Joi.number().integer().default(10),
        order               : Joi.number().integer(),
        includeUnverified   : Joi.boolean().default(false)
    })
})

const updateBusinessType    = celebrate({
    params                  : Joi.object().keys({
        _id                 : Joi.string().required().regex(mongoIdRegex)
    }),
    body                    : Joi.object().keys({
        name                : Joi.string().max(50),
        businessTerm        : Joi.string().max(50),
        customerTerm        : Joi.string().max(50)
    }).or('name', 'businessTerm', 'customerTerm')
})

const getBusinessTypeById   = celebrate({
    params                  : Joi.object().keys({
        _id                 : Joi.string().required().regex(mongoIdRegex)
    })
})

module.exports              = {
    createBusinessType,
    getBusinessTypes,
    updateBusinessType,
    getBusinessTypeById
}