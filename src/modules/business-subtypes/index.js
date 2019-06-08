'use strict'

const express       = require('express'),
    router          = express.Router(),
    authentication  = require('../../utils/authentication'),
    resource        = require('../../utils/constants').resource,
    accessAllowed   = require('../../utils/authorization').accessAllowed,
    validator       = require('./business-subtypes-validator'),
    controller      = require('./business-subtypes-controller');

router.post('/:businessType', authentication.verifyToken, accessAllowed('create', resource.businessSubTypes), validator.createBusinessSubType, controller.createBusinessSubType)

router.get('/businessType/:businessType' , authentication.verifyToken, validator.getBusinessSubTypesByBusinessType, controller.getBusinessSubTypesByBusinessType)

router.get('/getAllBusinessSubTypes' , authentication.verifyToken, accessAllowed('readAny', resource.businessSubTypes), validator.getAllBusinessSubTypes, controller.getAllBusinessSubTypes)

router.get('/getBusinessSubTypeById/:businessSubType' , authentication.verifyToken, validator.getBusinessSubTypeById, controller.getBusinessSubTypeById)

router.get('/multipleBusinessTypes', authentication.verifyToken, validator.getBusinessSubTypesForMultipleBusinessTypes, controller.getBusinessSubTypesForMultipleBusinessTypes)

router.patch('/:businessSubType', authentication.verifyToken, validator.updateBusinessSubType, controller.updateBusinessSubType)

module.exports      = router