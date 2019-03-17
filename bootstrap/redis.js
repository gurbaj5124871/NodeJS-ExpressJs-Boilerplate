const   Promise         = require('bluebird'),
        redis           = require('redis'),
        logger          = require('../src/utils/logger'),
        config          = require('../app-config');

Promise.promisifyAll(redis.RedisClient.prototype)
Promise.promisifyAll(redis.Multi.prototype)

if(process.env.redisDebug == true)
redis.debug_mode         = true;

function redisConnect() {
    return new Promise((res, rej) => {
        const url      = config.get('/redis');

        global.redisClient = redis.createClient({
            url,
            connect : opts => {
                if (opts.error && opts.error.code === 'ECONNREFUSED') {
                    return rej(new Error('The server refused the connection'))
                }
            }
        })

        redisClient.on('connect', () => {
            logger.info(`Thor (redis) connected`)
            // var commands = require('redis-commands')
            // commands.list.forEach(function (command) {
            //     logger('redis commands: ',command)
            //   })
            res()
        })

        redisClient.on('error', err => {
            logger.error('Redis Error ' + err)
            rej(err)
        })

        redisClient.on('end', err => {
            logger.warn('Redis Error ' + err)
            // set triggers
            rej(err)
        })
    })
}

//function exitRedis() {redisClient.end(true)}

// process.on('SIGINT', () => {
//     exitRedis()
//     // Gracefully Shutdown
//     //setTimeout(exitRedis, 2000)
// })

module.exports = redisConnect