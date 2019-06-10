'use strict'

const express       = require('express'),
    router          = express.Router(),
    authentication  = require('../../utils/authentication'),
    resource        = require('../../utils/constants').resource,
    accessAllowed   = require('../../utils/authorization').accessAllowed,
    validator       = require('./admin-validator'),
    controller      = require('./admin-controller');


router.post('/login', validator.login, controller.login)

router.post('/', authentication.verifyAdminToken, accessAllowed('create', resource.admin), validator.createAdmin, controller.createAdmin)

router.post('/logout', authentication.verifyAdminToken, controller.logout)

// Regarding Service Providers
router.patch('/serviceProviders/:serviceProviderId', authentication.verifyAdminToken, validator.updateServiceProvider, controller.updateServiceProvider)

// Regarding Customers
router.patch('/customers/:customerId', authentication.verifyAdminToken, validator.updateCustomer, controller.updateCustomer)

module.exports      = router