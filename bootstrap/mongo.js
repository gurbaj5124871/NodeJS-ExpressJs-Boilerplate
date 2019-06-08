'use strict'

const Promise       = require('bluebird'),
      mongoose      = Promise.promisifyAll(require('mongoose')),
      config        = require('../config'),
      logger        = require('../src/utils/logger');


mongoose.Promise    = Promise

function mongodbConnect() {
    return new Promise((res, rej) => {
        mongoose.connect(config.get('/mongodb'), { useNewUrlParser: true, useCreateIndex: true })
            .then(() => {
                logger.info('Captain America (Mongo DB) Connected')

                if (process.env.MONGO_DEBUG === 'true')
                mongoose.set('debug', true)
        
                res()
            })
            .catch(err => {
                logger.error('Error in database bootstraping, err: ', err)
                rej(err)
                process.exit(1)
            })
    })
}

function exitMongo() {
    mongoose.disconnect(err => {
        if (err)
            logger.error(err)
        logger.info('Database disconnection')
        process.exit(1);
    })
}

process.on('SIGINT', () => {
    exitMongo()
    // Gracefully Shutdown
    //setTimeout(exitFunction, 2000)
})

module.exports = mongodbConnect