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

// router.get('/:userId', authentication.verifyToken, validator.updateSserviceProviderById, controller.updateSserviceProviderById)

// router.get('/handle/:handle', authentication.verifyToken, validator.updateSserviceProviderById, controller.updateSserviceProviderById)

// router.patch('/:userId', authentication.verifyToken, validator.updateSserviceProviderById, controller.updateSserviceProviderById)

module.exports      = router