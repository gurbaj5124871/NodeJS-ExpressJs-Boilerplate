'use strict'

const mqtt              = require('mqtt'),
    config              = require('../../app-config'),
    topics              = require('./topics');

const client            = mqtt.connect(config.get('/mqttBroker/url'), {
    clientId            : config.get('/mqttBroker/clientId'),
    username            : config.get('/mqttBroker/username'),
    password            : config.get('/mqttBroker/password'),
    qos                 : 2,
    clean               : true // when server is down don't want to recieve requests
})

client.on('connect', function () {
    client.subscribe({[topics.ownTopic]: {qos: 2}}, function (err) {
        if (!err) {
            console.log(`subscribed to own topic at ${topics.ownTopic}`)
        }
    })
})

client.on('message', function (topic, message) {
    
})