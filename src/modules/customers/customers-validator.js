'use strict'

const { celebrate, Joi }    = require('celebrate'),
    constants               = require('../../utils/constants'),
    mongoIdRegex            = /^[0-9a-fA-F]{24}$/;

// const signupByAdmin         = celebrate({
//     body                    : Joi.object().keys({
//         phoneNumber         : Joi.string().regex(/^[0-9]+$/).min(5).required(),
//         extention           : Joi.string().regex(/^[0-9,+]+$/).trim().min(2).required(),
//         email               : Joi.string().email(),
//         firstName           : Joi.string().required().max(160),
//         lastName            : Joi.string().required().max(160),
//         bio                 : Joi.string().max(2000),
//         gender              : Joi.string().valid([]),
//         dob                 : Joi.date(),
//         imageUrl            : Joi.string().uri({scheme: ['https']}),
//     }).xor('email', 'phoneNumber')
// })

const requestLogin          = celebrate({
    query                   : Joi.object().keys({
        phoneNumber         : Joi.string().regex(/^[0-9]+$/).min(5).required()
    })
})

const signupViaPhone        = celebrate({
    body                    : Joi.object().keys({
        extention           : Joi.string().regex(/^[0-9,+]+$/).trim().min(2).required(),
        phoneNumber         : Joi.string().regex(/^[0-9]+$/).min(5).required(),
        OTP                 : Joi.number().required().min(1000000).max(999999),
        firstName           : Joi.string().required().max(160),
        lastName            : Joi.string().required().max(160)
    })
})

const loginViaPhone         = celebrate({
    body                    : Joi.object().keys({
        extention           : Joi.string().regex(/^[0-9,+]+$/).trim().min(2).required(),
        phoneNumber         : Joi.string().regex(/^[0-9]+$/).min(5).required(),
        OTP                 : Joi.number().required().min(1000000).max(999999),
    })
})

const socialLogins          = celebrate({
    body                    : Joi.object().keys({
        accessToken         : Joi.string().required()
    })
})

module.exports              = {
    // signupByAdmin,
    requestLogin,
    signupViaPhone,
    loginViaPhone,
    socialLogins
}