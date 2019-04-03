const mongo                     = require('../../utils/mongo'),
    constants                   = require('../../utils/constants'),
    errify                      = require('../../utils/errify'),
    errMsg                      = require('../../utils/error-messages'),
    BusinessSubTypes            = require('./business-subtypes-model');

const getBusinessSubTypesByBusinessType = (businessType, limit, lastSubBusinessType) => {
    const criteria              = {businessType}
    if(lastSubBusinessType)
        criteria['_id']         = {$gt: lastSubBusinessType}
    // sorting logic to be updated
    const options               = {sort: {_id: -1}, lean: true}
    if(limit)
        options['limit']        = limit
    return BusinessSubTypes.find(criteria, {__v: 0}, options)
}

const getAllBusinessSubTypes    = (sortingOptions, limit, lastSubBusinessType) => {
    const criteria              = {}
    if(lastSubBusinessType)
        criteria['_id']         = {$gt: lastSubBusinessType}
    const sort                  = (sortingOptions => {
        switch(sortingOptions){
            case 2              : return {createdOn: 1}
            case 3              : return {noOfCustomersInterested: 1, createdOn: -1}
            default             : return {createdOn: -1}
        }
    })(sortingOptions);
    return BusinessSubTypes.aggregate([
        {$match : criteria}, {$sort: sort}, {$limit: limit},
        {$lookup: {from: 'businesstypes', localField: 'businessType', foreignField: '_id', as: 'businessType'}},
        {$unwind: '$businessType'},
        {$project: {
            name: 1, businessTerm: 1, customerTerm: 1, imageUrl: 1, isVerified: 1, noOfCustomersInterested: 1,
            businessType: {
                _id: '$businessType._id', name: '$businessType.name', businessTerm: '$businessType.businessTerm',
                customerTerm: '$businessType.customerTerm', imageUrl: '$businessType.imageUrl',
                isVerified: '$businessType.isVerified'
            }
        }}
    ])
}

const getBusinessSubTypeById    = (_id, isVerified) => {
    const criteria              = {_id}
    if(typeof isVerified === "boolean")
        criteria['isVerified']  = isVerified
    return mongo.findOne(BusinessSubTypes, criteria, {__v: 0}, {lean: true})
}

const getBusinessSubTypesForMultipleBusinessTypes = businessTypes => {
    return BusinessSubTypes.aggregate([
        {$match : {businessType: {$in: businessTypes}}}, {$sort: {noOfCustomersInterested: 1, createdOn: -1}},
        {$lookup: {from: 'businesstypes', localField: 'businessType', foreignField: '_id', as: 'businessType'}},
        {$unwind: '$businessType'},
        {$project: {
            name: 1, businessTerm: 1, customerTerm: 1, imageUrl: 1, isVerified: 1, noOfCustomersInterested: 1,
            businessType: {
                _id: '$businessType._id', name: '$businessType.name', businessTerm: '$businessType.businessTerm',
                customerTerm: '$businessType.customerTerm', imageUrl: '$businessType.imageUrl',
                isVerified: '$businessType.isVerified'
            }
        }}
    ])
}

const getMultipleBusinessSubTypes = (_ids, isVerified, projections = {__v: 0}) => {
    const criteria = {_id: {$in: _ids}}
    if(typeof isVerified === "boolean")
        criteria['isVerified']  = isVerified
    return BusinessSubTypes.find(criteria, projections).lean()
}

module.exports                  = {
    getBusinessSubTypesByBusinessType,
    getAllBusinessSubTypes,
    getBusinessSubTypeById,
    getBusinessSubTypesForMultipleBusinessTypes,
    getMultipleBusinessSubTypes
}