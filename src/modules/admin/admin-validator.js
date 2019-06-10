'use strict'

const { celebrate, Joi }    = require('celebrate'),
      mongoIdRegex          = /^[0-9a-fA-F]{24}$/;


const login                 = celebrate({
    body                    : Joi.object().keys({
        email               : Joi.string().email().required(),
        password            : Joi.string().required()
    })
})

const createAdmin           = celebrate({
    body                    : Joi.object().keys({
        name                : Joi.string().required(),
        email               : Joi.string().email().required(),
        password            : Joi.string().required()
    })
})

const updateServiceProvider = celebrate({
    body                    : Joi.object().keys({
        isAdminVerified     : Joi.boolean().valid(true),
        isBlocked           : Joi.boolean(),
        isDeleted           : Joi.boolean().valid(true)
    }).xor('isAdminVerified', 'isBlocked', 'isDeleted')
})

const updateCustomer        = celebrate({
    body                    : Joi.object().keys({
        isBlocked           : Joi.boolean(),
        isDeleted           : Joi.boolean().valid(true)
    }).xor('isBlocked', 'isDeleted')
})

module.exports              = {
    login,
    createAdmin,
    updateServiceProvider,
    updateCustomer
}