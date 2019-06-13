const {redis}       = require('../utils/redis'), 
    redisSub        = require('ioredis'),
    config          = require('../../config'),
    logger          = require('../utils/logger'),
    channels        = require('./channels');

const sub           = new redisSub(config.get('/redis'))
sub.Promise         = require('bluebird')

sub.psubscribe(channels.ownTopic, async (err, count) => {
    if(!err) {
        const microService      = config.get('/microServiceName')
        try {
            const failOverMess  = await redis.xlen(microService)
            if(failOverMess > 0) {
                logger.info('Handling failover events')
                const messages = await redis.xrange(microService, '-', '+', failOverMess)
                for(let i=0; i<messages.length; i+=1) {
                    const log       = messages[i][0]
                    const channel   = messages[i][1][1]
                    const message   = JSON.stringify(Object.assign(JSON.parse(messages[i][1][3]), {log}))
                    await handleMessages(channel, message)
                }
            }
            await publish(channels.hello, {data: {}})
        } catch (err) {
            console.log(err)
            logger.error(err)
        }
    }
})

sub.on('pmessage', async (pattern, channel, message) => {
    logger.info(`message recieved: channel: ${channel}, message: ${message}`)
    handleMessages(channel, message)
})

const handleMessages        = async (channel, message) => {
    try {
        message     = JSON.parse(message)
        const channelStructure = channel.split('/')
        switch(channelStructure[2]) {
            case 'hello': logger.info('Flash (Redis) Subscriber Connected')
                break
        }
        if(message.log)
            await redis.xdel(channelStructure[1], message.log)
    } catch (err) {
        logger.error(err)
    }
}

const publish               = async (channel, message) => {
    const microService      = config.get('/microServiceName')
    if(process.env.NODE_ENV === 'prod')
        logger.info(`${microService} published to: channel: ${channel}`)
    else logger.info(`${microService} published to: channel: ${channel}: message: ${JSON.stringify(message)}`)
    const log = await redis.xadd(channel.split('/')[1], '*', ['channel', channel, 'message', JSON.stringify(message)])
    const pub = await redis.publish(channel, JSON.stringify(Object.assign(message, {log})))
    return {pub, log}
}

const sendSpAdminApproval   = (serviceProviderId, name) => publish(`${channels.sendSpAdminApproval}/${serviceProviderId}`, {data: {serviceProvider: {name}}})

module.exports              = {
    publish,
    sendSpAdminApproval
}