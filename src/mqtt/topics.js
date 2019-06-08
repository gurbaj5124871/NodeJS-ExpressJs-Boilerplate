'use strict'

const config            = require('../../config');
const getMsTopic        = msName => `microservice/${msName}`

module.exports          = Object.freeze({
    // microservices topics
    ownTopic            : `${getMsTopic(config.get('/microServiceName'))}`,
    chatServer          : `${getMsTopic('joker')}`
})