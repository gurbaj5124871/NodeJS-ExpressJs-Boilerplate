'use strict'

const { celebrate, Joi }    = require('celebrate'),
    constants               = require('../../utils/constants'),
    mongoIdRegex            = /^[0-9a-fA-F]{24}$/;

const signupByAdmin         = celebrate({
    body                    : Joi.object().keys({
        phoneNumber         : Joi.string().regex(/^[0-9]+$/).min(5).required(),
        extention           : Joi.string().regex(/^[0-9,+]+$/).trim().min(2).required(),
        email               : Joi.string().email(),
        firstName           : Joi.string().required().max(160),
        lastName            : Joi.string().required().max(160),
        bio                 : Joi.string().max(2000),
        gender              : Joi.string().valid([]),
        dob                 : Joi.date(),
        imageUrl            : Joi.string().uri({scheme: ['https']}),
    }).xor('email', 'phoneNumber')
})

const requestLogin          = celebrate({
    body                    : Joi.object().keys({
        extention           : Joi.string().regex(/^[0-9,+]+$/).trim().min(2).required(),
        phoneNumber         : Joi.string().regex(/^[0-9]+$/).min(5).required()
    })
})

const signupViaPhone        = celebrate({
    body                    : Joi.object().keys({
        extention           : Joi.string().regex(/^[0-9,+]+$/).trim().min(2).required(),
        phoneNumber         : Joi.string().regex(/^[0-9]+$/).min(5).required(),
        OTP                 : Joi.number().required().min(100000).max(999999),
        firstName           : Joi.string().max(160),
        lastName            : Joi.string().max(160),
        imageUrl            : Joi.string().uri({scheme: ['https']})
    })
})

const completeProfile       = celebrate({
    params                  : Joi.object().keys({
        customerId          : Joi.string().required().regex(mongoIdRegex)
    }),
    body                    : Joi.object().keys({
        firstName           : Joi.string().max(160).required(),
        lastName            : Joi.string().max(160).required(),
        imageUrl            : Joi.string().uri({scheme: ['https']})
    })
})

const loginViaPhone         = celebrate({
    body                    : Joi.object().keys({
        //extention           : Joi.string().regex(/^[0-9,+]+$/).trim().min(2).required(),
        phoneNumber         : Joi.string().regex(/^[0-9]+$/).min(5).required(),
        OTP                 : Joi.number().required().min(100000).max(999999),
    })
})

const getAllCustomers       = celebrate({
    query                   : Joi.object().keys({
        limit               : Joi.number().integer().default(50),
        lastCustomerId      : Joi.string().regex(mongoIdRegex),
        isSignupComplete    : Joi.boolean(),
        isBlocked           : Joi.boolean(),
        // -1 = createdAt desc, 1 = createdAt asce
        sort                : Joi.number().integer().valid([-1, 1]).default(-1),
        search              : Joi.string()
    })
})

const getCustomerById       = celebrate({
    params                  : Joi.object().keys({
        customerId          : Joi.string().required().regex(mongoIdRegex)
    })
})

const updateCustomerById    = celebrate({
    params                  : Joi.object().keys({
        customerId          : Joi.string().required().regex(mongoIdRegex)
    }),
    body                    : Joi.object().keys({
        firstName           : Joi.string().max(160),
        lastName            : Joi.string().max(160),
        imageUrl            : Joi.string().uri({scheme: ['https']})
    }).or('firstName', 'lastName', 'imageUrl')
})

const socialLogins          = celebrate({
    body                    : Joi.object().keys({
        accessToken         : Joi.string().required()
    })
})

module.exports              = {
    signupByAdmin,
    requestLogin,
    signupViaPhone,
    completeProfile,
    loginViaPhone,
    getAllCustomers,
    getCustomerById,
    updateCustomerById,
    socialLogins
}