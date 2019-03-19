const mongoose              = require('mongoose'),
      constants             = require('../../utils/constants');

const businessTypesSchema   = mongoose.Schema({
    name                    : {type: String, required: true},
    businessTerm            : String,
    customerTerm            : String,
    order                   : Number,
    imageUrl                : String,
    isVerified              : {type: Boolean, default: false, index: true}
}, {timestamps: true})

const BusinessTypes         = mongoose.model('BusinessTypes', businessTypesSchema);

module.exports              = BusinessTypes;