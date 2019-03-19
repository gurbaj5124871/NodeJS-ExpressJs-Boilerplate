const mongo                     = require('../../utils/mongo'),
    {redis, redisKeys}          = require('../../utils/redis'),
    constants                   = require('../../utils/constants'),
    errify                      = require('../../utils/errify'),
    errMsg                      = require('../../utils/error-messages'),
    BusinessTypes               = require('./business-types-model');

const getOrderForBusinessType   = async (order = undefined) => {
    const criteria              = {isVerified: true}
    if(order)                   {
        const update            = await mongo.updateOne(BusinessTypes, Object.assign(updateMany, {order: {$gte: order}}), {$inc: {order: 1}})
        if(update.nModified > 0)
            await redis.delAsync(redisKeys.businessTypes)    
    } else {
        order                   = await redis.zrevrange(redisKeys.businessTypes, 0, 0, 'WITHSCORES')
        if(order.length)
            order = Number(order[1]) + 1
        else {
            order = await mongo.findOne(BusinessTypes, criteria, {order: 1}, {sort: {order: -1}, lean: true})
            order = order ? order.order + 1 : 1
        }
    }
    return order
}

const createBusinessType        = async businessType => {
    businessType                = await mongo.createOne(BusinessTypes, businessType)
    await redis.zaddAsync(redisKeys.businessTypes, businessType.order, JSON.stringify(businessType))
    return businessType.toJSON()
}

module.exports                  = {
    getOrderForBusinessType,
    createBusinessType
}