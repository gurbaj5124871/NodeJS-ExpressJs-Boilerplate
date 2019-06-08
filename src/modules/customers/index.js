'use strict'

const express       = require('express'),
    router          = express.Router(),
    authentication  = require('../../utils/authentication'),
    resource        = require('../../utils/constants').resource,
    accessAllowed   = require('../../utils/authorization').accessAllowed,
    validator       = require('./customers-validator'),
    controller      = require('./customers-controller');

// // admin api to register customer
// router.post('/', authentication.verifyToken, accessAllowed('create', resource.customer), validator.signup, controller.createCustomerByAdmin)

router.patch('/requestLogin', validator.requestLogin, controller.requestLogin)

router.post('/signup/phone', validator.signupViaPhone, controller.signupViaPhone)

router.post('/login/phone', validator.loginViaPhone, controller.loginViaPhone)

// router.post('/login/google', validator.googleLogin, controller.googleLogin)

// // // via email in inbox
// // router.post('/login/firebase', validator.firebaseLogin, controller.firebaseLogin)

// router.post('/login/facebook', validator.facebookLogin, controller.facebookLogin)

router.post('/logout', authentication.verifyToken, controller.logout)

module.exports      = router