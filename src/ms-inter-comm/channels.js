'use strict'

const config            = require('../../config');
const getMsTopic        = msName => `microservice/${msName}`;

module.exports          = Object.freeze({
    // microservices topics
    ownTopic            : `${getMsTopic(config.get('/microServiceName'))}/*`,
    chatServer          : `${getMsTopic('joker')}`,

    // message publish channels
    hello               : `${getMsTopic(config.get('/microServiceName'))}/hello`,
    sendSpAdminApproval : `${getMsTopic('joker')}/spAdminVerified`
})