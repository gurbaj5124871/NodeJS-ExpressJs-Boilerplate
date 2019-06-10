'use strict'

const express       = require('express'),
    router          = express.Router(),
    authentication  = require('../../utils/authentication'),
    resource        = require('../../utils/constants').resource,
    accessAllowed   = require('../../utils/authorization').accessAllowed,
    validator       = require('./customers-validator'),
    controller      = require('./customers-controller');

// admin api to register customer
router.post('/', authentication.verifyToken, accessAllowed('create', resource.customer), validator.signupByAdmin, controller.createCustomerByAdmin)

router.put('/requestLogin', validator.requestLogin, controller.requestLogin)

router.post('/signup/phone', validator.signupViaPhone, controller.signupViaPhone)

router.patch('/completeProfile/:customerId', authentication.verifyToken, validator.completeProfile, controller.completeProfile)

router.post('/login/phone', validator.loginViaPhone, controller.loginViaPhone)

router.post('/logout', authentication.verifyToken, controller.logout)

router.get('/', authentication.verifyToken, accessAllowed('readAny', resource.allCustomers), validator.getAllCustomers, controller.getAllCustomers)

router.get('/:customerId', authentication.verifyToken, accessAllowed('readAny', resource.customer), validator.getCustomerById, controller.getCustomerById)

router.patch('/:customerId', authentication.verifyToken, validator.updateCustomerById, controller.updateCustomerById)

module.exports      = router