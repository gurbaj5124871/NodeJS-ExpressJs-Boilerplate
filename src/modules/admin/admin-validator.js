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

module.exports              = {
    login,
    createAdmin
}