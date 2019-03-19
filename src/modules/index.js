const admin             = require('./admin')
const users             = require('./users')
const businessTypes     = require('./business-types')


module.exports          = app => {

    app.use('/admin', admin)
    app.use('/businessTypes', businessTypes)

}