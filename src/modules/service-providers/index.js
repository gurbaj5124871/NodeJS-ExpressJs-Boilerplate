const express       = require('express'),
    router          = express.Router(),
    authentication  = require('../../utils/authentication'),
    resource        = require('../../utils/constants').resource,
    accessAllowed   = require('../../utils/authorization').accessAllowed,
    validator       = require('./service-providers-validator'),
    controller      = require('./service-providers-controller');

// admin api to register service provider
router.post('/', authentication.verifyToken, accessAllowed('create', resource.serviceProvider), validator.signup, controller.createServiceProviderByAdmin)

router.post('/signup', validator.signup, controller.signup)

router.post('/login', validator.login, controller.login)

router.post('/logout', authentication.verifyToken, controller.logout)

// admin api to get all service providers
router.get('/', authentication.verifyToken, accessAllowed('readAny', resource.allServiceProviders), validator.getAllServiceProviders, controller.getAllServiceProviders)

router.get('/:serviceProvider', authentication.verifyTokenIfExists, validator.getServiceProviderById, controller.getServiceProviderById)

router.get('/handle/:handle', authentication.verifyTokenIfExists, validator.getServiceProviderByHandle, controller.getServiceProviderByHandle)

router.patch('/:serviceProvider', authentication.verifyToken, validator.updateServiceProviderById, controller.updateServiceProviderById)

router.patch('/:serviceProvider/updateBusinessSubTypes', authentication.verifyToken, validator.updateBusinessSubTypes, controller.updateBusinessSubTypes)

module.exports      = router