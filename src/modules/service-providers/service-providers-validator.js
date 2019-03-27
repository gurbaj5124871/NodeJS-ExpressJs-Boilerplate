const { celebrate, Joi }    = require('celebrate'),
    constants               = require('../../utils/constants'),
    mongoIdRegex          = /^[0-9a-fA-F]{24}$/;


const signup                = celebrate({
    body                    : Joi.object().keys({
        email               : Joi.string().email().required(),
        password            : Joi.string().required(),
        phoneNumber         : Joi.string().regex(/^[0-9]+$/).min(5).required(),
        extention           : Joi.string().regex(/^[0-9,+]+$/).trim().min(2).required(),
        name                : Joi.string().required().max(160),
        imageUrl            : Joi.string().uri({scheme: ['https']}),
        description         : Joi.string().max(2000),
        googleLocation      : Joi.object().keys({
            country         : Joi.string().max(2000),
            region          : Joi.string().max(2000),
            locality        : Joi.string().max(2000),
            placeId         : Joi.string().max(2000),
            loc             : Joi.object().keys({
                type        : Joi.string().valid('Point').default('Point'),
                coordinates : Joi.array().items(Joi.number()).min(2).max(2).required()
            }).required()
        }).required(),
        businessType        : Joi.string().required().regex(mongoIdRegex),
        businessModelTypes  : Joi.array().items(
            Joi.number().integer().valid(Object.values(constants.businessModelTypes))
        ).required().min(1).max(Object.keys(constants.businessModelTypes).length),
        ownershipType       : Joi.number().integer().valid(Object.values(constants.businessOwnershipTypes))
    })
})

const login                 = celebrate({
    body                    : Joi.object().keys({
        email               : Joi.string().email(),
        phoneNumber         : Joi.string().regex(/^[0-9]+$/).min(5),
        password            : Joi.string().required()
    }).xor('email', 'phoneNumber')
})

module.exports              = {
    signup,
    login
}