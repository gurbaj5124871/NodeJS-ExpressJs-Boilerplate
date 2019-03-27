const mongoose                  = require('mongoose');

const businessSubTypesSchema    = mongoose.Schema({
    businessType                : {type: mongoose.Schema.ObjectId, required: true, ref: 'BusinessTypes'},
    name                        : {type: String, required: true},
    businessTerm                : String,
    customerTerm                : String,
    imageUrl                    : String,
    noOfCustomersInterested     : {type: Number, default: 0},
    isVerified                  : {type: Boolean, default: false, index: true}
}, {timestamps: true})

const BusinessSubTypes          = mongoose.model('BusinessSubTypes', businessSubTypesSchema);

module.exports                  = BusinessSubTypes;