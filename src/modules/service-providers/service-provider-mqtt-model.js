'use strict'

const mongoose              = require('mongoose');

const spMqttSchema          = mongoose.Schema({
    userId                  : {type: mongoose.Schema.ObjectId, ref: 'ServiceProvider', index: true},
    topic                   : String,
    topicType               : String
}, {timestamps: true, read: 'primaryPreferred'});

const ServiceProviderMqtt   = mongoose.model('ServiceProviderMqtt', spMqttSchema);

module.exports              = ServiceProviderMqtt;