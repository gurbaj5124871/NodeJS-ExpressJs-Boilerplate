const redis                 = require('../../bootstrap/redis').redisClient;

const redisKeys             = Object.freeze({
    // sorted set storing verified business types
    businessTypes           : `businessTypes:`
})

module.exports              = {
    redis,
    redisKeys
}