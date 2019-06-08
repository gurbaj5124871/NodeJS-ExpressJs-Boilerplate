'use strict'

const admin             = require('./admin')
const serviceProviders  = require('./service-providers')
const businessTypes     = require('./business-types')
const businessSubTypes  = require('./business-subtypes')
const customers         = require('./customers')


module.exports          = app => {
    app.use('/admin', admin)
    app.use('/businessTypes', businessTypes),
    app.use('/businessSubTypes', businessSubTypes)
    app.use('/serviceProviders', serviceProviders)
    app.use('/customers', customers)
}