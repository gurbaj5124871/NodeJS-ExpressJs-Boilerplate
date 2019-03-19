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

const getBusinessTypesCache     = async (limit = 10, order = '-inf') => {
    const key                   = redisKeys.businessTypes
    if (await redis.exists(key) === 0) {
        const businessTypes     = await getBusinessTypes()
        if(businessTypes.length === 0)
            return []
        await redis.zaddAsync(key, businessTypes.reduce((arr, buss) => {
            arr.push(buss.order, JSON.stringify(buss))
            return arr
        }, []))
    }
    const startRange            = '(' + order
    const businessTypes         = await redis.zrangebyscoreAsync(key, startRange, '+inf', 'limit', 0, limit +1)
    return businessTypes.map(JSON.parse)
}

const getBusinessTypes          = (includeUnverified = false, limit = undefined, order) => {
    const criteria              = {isVerified: true}, options = {lean: true};
    if(order)
        criteria['order']       = {$gt: order}
    if(includeUnverified)
        delete criteria.isVerified
    if(limit)
        options['limit']        = limit + 1
    return mongo.find(BusinessTypes, criteria, {__v: 0}, options)
}

const getBusinessTypesCount     = async (includeUnverified = false) => {
    if(includeUnverified)
        return BusinessTypes.countDocuments()
    else {
        let count               = await redis.zcardAsync(redisKeys.businessTypes)
        if(!count)
        count                   = BusinessTypes.countDocuments({isVerified: true})
        return count
    }
}

const paginateBusinessTypes     = (businessTypes, limit) => {
    let next                    = false
    if(businessTypes.length > limit) {
        businessTypes.pop()
        next                    = `?limit=${limit}&order=${businessTypes[businessTypes.length -1].order}`
    }
    return {businessTypes, next}
}

module.exports                  = {
    getOrderForBusinessType,
    createBusinessType,
    getBusinessTypesCache,
    getBusinessTypes,
    getBusinessTypesCount,
    paginateBusinessTypes
}