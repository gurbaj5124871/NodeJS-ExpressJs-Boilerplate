'use strict'

const mongoose  = require('mongoose');

// CRUD Services for mongodb

const createOne = async (model, doc) => {
    return new model(doc).saveAsync()
}

const insertMany = async (model, docs) => {
    return new Promise((res, rej) => { model.insertMany(docs, (e, data) => { if (e) { rej(e) } else { res(data) } }) })
}

const find      = async(model, criteria, projection, options) => {
    return model.findAsync(criteria, projection, options)
}

const findOne   = async (model, criteria, projection, options) => {
    return model.findOneAsync(criteria, projection, options)
}

const count     = async (model, criteria) => {
    return model.countDocumentsAsync(criteria)
}

const findOneAndUpdate = async (model, criteria, updation, options) => {
    return model.findOneAndUpdateAsync(criteria, updation, options)
}

const updateOne = async (model, criteria, updation, options = {}) => {
    return model.updateOneAsync(criteria, updation, options)
}

const updateMany = async (model, criteria, updation, options = {}) => {
    return model.updateManyAsync(criteria, updation, options)
}

const findOneAndRemove = async (model, criteria) => {
    return model.findOneAndRemoveAsync(criteria)
}

const deleteMany = async (model, criteria) => {
    return model.deleteManyAsync(criteria);
}

const aggregate = async (model, pipeline) => {
    return model.aggregateAsync(pipeline)
}

const bulkWrite = async (model, operations, options) => {
    const opts = Object.extend({}, options || {})
    opts.ordered = (typeof opts.ordered == 'boolean') ? opts.ordered : true
    return model.bulkWrite(operations, opts)
}

const findStream = async (model, match) => {
    return model.findAsync(match).cursor().exec().stream()
}

const aggregateStream = async (model, pipeline) => {
    return model.aggregate(pipeline).cursor().exec().stream()
}

const insertManyWithPopulate = async (model, arrayToSave, populateOptions) => {
    return new Promise((res, rej) => {
        model.insertMany(arrayToSave, (e, docs) => { if (e) { rej(e) } else { model.populate(docs, populateOptions, (e, data) => { if (e) { rej(err) } else { res(data) } }) } })
    })
}

const getObjectId   = (id = null) => {
    if(id)
        return mongoose.Types.ObjectId(id)
    return mongoose.Types.ObjectId()
}

module.exports      = {
    createOne,
    insertMany,
    find,
    findOne,
    count,
    findOneAndUpdate,
    updateOne,
    updateMany,
    findOneAndRemove,
    deleteMany,
    aggregate,
    bulkWrite,
    findStream,
    aggregateStream,
    insertManyWithPopulate,
    getObjectId
}