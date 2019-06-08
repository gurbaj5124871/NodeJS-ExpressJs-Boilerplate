'use strict'

const { celebrate, Joi }    = require('celebrate'),
    constants               = require('../../utils/constants'),
    mongoIdRegex            = /^[0-9a-fA-F]{24}$/,
    urlSafeRegex            = /^[a-zA-Z0-9_-]*$/;   // ^                : the beginning of the string
                                                    // [a-zA-Z0-9_-]*   : any character of: 'a' to 'z', 'A' to 'Z' & '0' to '9', '_', '-' (0 or more times)
                                                    // $                : before an optional \n, and the end of the string
const signup                = celebrate({
    body                    : Joi.object().keys({
        email               : Joi.string().email(),
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
        // businessModelTypes  : Joi.array().items(
        //     Joi.number().integer().valid(Object.values(constants.businessModelTypes))
        // ).required().min(1).max(Object.keys(constants.businessModelTypes).length),
        // ownershipType       : Joi.number().integer().valid(Object.values(constants.businessOwnershipTypes)).required()
    })
})

const login                 = celebrate({
    body                    : Joi.object().keys({
        email               : Joi.string().email(),
        phoneNumber         : Joi.string().regex(/^[0-9]+$/).min(5),
        password            : Joi.string().required()
    }).xor('email', 'phoneNumber')
})

const getAllServiceProviders= celebrate({
    query                   : Joi.object().keys({
        limit               : Joi.number().integer().default(50),
        lastServiceProviderId:Joi.string().regex(mongoIdRegex),
        isAdminVerified     : Joi.boolean(),
        // 1 = createdOn desc, 2 = createdOn asce
        sort                : Joi.number().integer().valid([1, 2]).default(1),
        search              : Joi.string()
    })
})

const getServiceProviderById= celebrate({
    params                  : Joi.object().keys({
        serviceProvider     : Joi.string().required().regex(mongoIdRegex)
    })
})

const getServiceProviderByHandle = celebrate({
    params                  : Joi.object().keys({
        handle              : Joi.string().required()
    })
})

const updateServiceProviderById = celebrate({
    params                  : Joi.object().keys({
        serviceProvider     : Joi.string().required().regex(mongoIdRegex)
    }),
    body                    : Joi.object().keys({
        name                : Joi.string(),
        handle              : Joi.string().regex(urlSafeRegex),
        imageUrl            : Joi.string().uri({scheme: ['https']}),
        description         : Joi.string().max(2000),
        // googleLocation      : Joi.object().keys({
        //     country         : Joi.string().max(2000),
        //     region          : Joi.string().max(2000),
        //     locality        : Joi.string().max(2000),
        //     placeId         : Joi.string().max(2000),
        //     loc             : Joi.object().keys({
        //         type        : Joi.string().valid('Point').default('Point'),
        //         coordinates : Joi.array().items(Joi.number()).min(2).max(2).required()
        //     }).required()
        // }),
        businessType        : Joi.string().regex(mongoIdRegex),
        businessModelTypes  : Joi.array().items(
            Joi.number().integer().valid(Object.values(constants.businessModelTypes))
        ).min(1).max(Object.keys(constants.businessModelTypes).length),
        ownershipType       : Joi.number().integer().valid(Object.values(constants.businessOwnershipTypes))
    })
})

const updateBusinessSubTypes= celebrate({
    params                  : Joi.object().keys({
        serviceProvider     : Joi.string().required().regex(mongoIdRegex)
    }),
    body                    : Joi.object().keys({
        updateType          : Joi.number().integer().valid([1, 2]).default(1), // 1 = add to the set, 2 = replace whole array
        businessSubTypes    : Joi.array().items(Joi.string().regex(mongoIdRegex)).min(1).required()
    })
})

module.exports              = {
    signup,
    login,
    getAllServiceProviders,
    getServiceProviderById,
    getServiceProviderByHandle,
    updateServiceProviderById,
    updateBusinessSubTypes
}