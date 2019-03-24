const admin             = require('./admin')
const serviceProviders  = require('./service-providers')
const businessTypes     = require('./business-types')


module.exports          = app => {
    app.use('/admin', admin)
    app.use('/businessTypes', businessTypes),
    app.use('/serviceProviders', serviceProviders)
}