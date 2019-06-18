'use strict'

const mongoose              = require('mongoose');

const followingsSchema      = mongoose.Schema({
    serviceProviderId       : {type: mongoose.Schema.ObjectId, index: true, ref: 'ServiceProvider'},
    customerId              : {type: mongoose.Schema.ObjectId, index: true, ref: 'Customer'},
    isDeleted               : {type: Boolean, default: false, index: true},
    mqttTopics              : {type: [String], default: []},
})

const Followings            = mongoose.model('Followings', followingsSchema);

module.exports              = Followings