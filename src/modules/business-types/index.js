const express       = require('express'),
    router          = express.Router(),
    authentication  = require('../../utils/authentication'),
    resource        = require('../../utils/constants').resource,
    accessAllowed   = require('../../utils/authorization').accessAllowed,
    validator       = require('./business-types-validator'),
    controller      = require('./business-types-controller');


router.post('/', authentication.verifyToken, accessAllowed('create', resource.businessTypes), validator.createBusinessType, controller.createBusinessType)

router.get('/', authentication.verifyToken, validator.getBusinessTypes, controller.getBusinessTypes)

router.patch('/:businessType', authentication.verifyToken, accessAllowed('updateAny', resource.businessTypes), validator.updateBusinessType, controller.updateBusinessType)

router.get('/:businessType', authentication.verifyToken, validator.getBusinessTypeById, controller.getBusinessTypeById)

router.post('/:businessType/businessSubType', authentication.verifyToken, accessAllowed('create', resource.businessSubTypes), validator.createBusinessSubType, controller.createBusinessSubType)

router.get('/:businessType/businessSubType' , authentication.verifyToken, validator.getBusinessSubTypesByBusinessType, controller.getBusinessSubTypesByBusinessType)

router.get('/businessSubType/businessSubType/getAllBusinessSubTypes' , authentication.verifyToken, accessAllowed('readAny', resource.businessSubTypes), validator.getAllBusinessSubTypes, controller.getAllBusinessSubTypes)

router.get('/businessSubType/businessSubType/getBusinessSubType/:businessSubType' , authentication.verifyToken, validator.getBusinessSubTypeById, controller.getBusinessSubTypeById)

router.patch('/businessSubType/businessSubType/updateBusinessSubType/:businessSubType', authentication.verifyToken, validator.updateBusinessSubType, controller.updateBusinessSubType)

module.exports      = router