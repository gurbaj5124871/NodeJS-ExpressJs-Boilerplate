const mongoose              = require('mongoose'),
      constants             = require('../../utils/constants');

const adminSchema           = mongoose.Schema({
    name                    : {type: String, required: true},
    email                   : {type: String, index: true, unique: true, trim: true, lowercase: true},
    password                : String
}, {timestamps: true})

const Admin                 = mongoose.model('Admin', adminSchema);

module.exports              = Admin;