'use strict'

const mongoose              = require('mongoose');

const customerMqttSchema    = mongoose.Schema({
    userId                  : {type: mongoose.Schema.ObjectId, ref: 'Customer', index: true},
    topic                   : String,
    topicType               : String
}, {timestamps: true, read: 'primaryPreferred'});

const CustomerMqtt          = mongoose.model('CustomerMqtt', customerMqttSchema);

module.exports              = CustomerMqtt;