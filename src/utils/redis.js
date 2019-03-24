const redis                 = require('../../bootstrap/redis').redisClient;

const redisKeys             = Object.freeze({

    // Sorted Set storing verified business types [score, value]
    businessTypes           : `businessTypes:`,

    // Hash map storing customers sessions [ NEVER EXPIRE ON PROD] {key : {sessionId: session}}
    customerSession         : customerId => `cutomerSession:${customerId}`,

    // Hash map storing service provider sessions [ NEVER EXPIRE ON PROD] {key : {sessionId: session}}
    serviceProviderSession  : serviceProviderId => `serviceProviderSession:${serviceProviderId}`,

    // Hash map storing admins sessions {key : {sessionId: session}}
    adminSession            : adminId => `adminSession:${adminId}`,

    
    
})

module.exports              = {
    redis,
    redisKeys
}