'use strict'

const Confidence        = require('confidence');

const criteria          = {
    env : process.env.NODE_ENV
}

const config            = {
    microServiceName    : 'user',
    
    port                : {
        $filter         : 'env',
        dev             : 3002,
        test            : 3001,
        prod            : process.env.PORT || 3003,
        $default        : 3001
    },

    jwt                 : {
        secret          : {
            $filter     : 'env',
            dev         : "development_secret",
            test        : "development_secret",
            prod        : "development_secret",
            $default    : "development_secret"
        },
        expireAfter     : {
            admin       : {
                web     : '1d'
            },
            serviceProvider: {
                android : '30d',
                ios     : '30d',
                web     : '7d',
                mobileWeb: '1d'
            },
            customer    : {
                android : '30d',
                ios     : '30d',
                web     : '1d',
                mobileWeb: '1d'
            }
        }
    },

    winston             : {
        $filter         : 'env',
        dev             : 'debug',
        test            : 'debug',
        prod            : 'info'
    },

    mongodb             : {
        $filter         : 'env',
        dev             : `mongodb://localhost:27017/base`,
        test            : `mongodb://localhost/base`,
        prod            : `mongodb://localhost/base`,
        $default        : 'mongodb://127.0.0.1:27017/base'
    },

    redis: {
        $filter         : 'env',
        dev             : 'redis://127.0.0.1:6379',
        test            : 'redis://localhost:6379',
        prod            : 'redis://127.0.0.1:6379',
        $default        : 'redis://localhost:6379'
    },

    morgan              : {
        $filter         : 'env',
        dev             : 'dev',
        test            : ':method :url :status :response-time ms - :req[x-real-ip] [:date[iso]]',
        prod            : ':method :url HTTP/:http-version :status :req[x-real-ip] [:date[iso]] \":remote-addr - :remote-user\" \":referrer\" \":user-agent\" - :response-time ms',
        $default        : 'dev'
    }
}

// Caching server configs and constants
const store             = new Confidence.Store(config)
const get               = key => store.get(key, criteria)
const meta              = key => store.meta(key, criteria)

module.exports          = { get, meta }