const express       = require('express'),
    router          = express.Router(),
    authentication  = require('../../utils/authentication'),
    resource        = require('../../utils/constants').resource,
    accessAllowed   = require('../../utils/authorization').accessAllowed,
    validator       = require('./business-types-validator'),
    controller      = require('./business-types-controller');


router.post('/', authentication.verifyToken, accessAllowed('create', resource.businessTypes), validator.createBusinessType, controller.createBusinessType)

router.get('/', authentication.verifyToken, validator.getBusinessTypes, controller.getBusinessTypes)

router.patch('/:_id', authentication.verifyToken, accessAllowed('updateAny', resource.businessTypes), validator.updateBusinessType, controller.updateBusinessType)

//router.get('/:_id', authentication.verifyToken, validator.getBusinessTypeById, controller.getBusinessTypeById)

module.exports      = router