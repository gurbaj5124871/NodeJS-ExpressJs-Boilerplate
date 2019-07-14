'use strict'

const redis                 = require('../../bootstrap/redis').redisClient;

const redisKeys             = Object.freeze({

    // Hash map storing admins sessions {key : {sessionId: session}}
    adminSession            : adminId => `adminSession:${adminId}`,
    
})

module.exports              = {
    redis,
    redisKeys
}