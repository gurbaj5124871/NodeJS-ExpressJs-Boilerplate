const mongoose              = require('mongoose'),
      constants             = require('../../utils/constants');

const googleLocation        = {
    country                 : String,
    region                  : String,
    locality                : String,
    placeId                 : String,
    loc                     : {type: {type: String}, coordinates: {type: [Number], default: void 0}}
}

const socialMediaLinks      = {
    type                    : {type: String, enum: Object.values(constants.socialProfileTypes)},
    link                    : String,
    countType               : String, // followers or subscribers etc
    count                   : Number,
    countString             : String,
    metaData                : Object
}

const serviceProviderSchema = mongoose.Schema({
    email                   : {type: String, index: true, trim: true, lowercase: true},
    phoneNumber             : {type: String, index: true, trim: true},
    extention               : {type: String, index: true, trim: true},
    password                : String,

    name                    : {type: String, required: true, trim: true},
    handle                  : {type: String, required: true, index: true},
    imageUrl                : String,
    description             : String,
    googleLocation          : googleLocation,
    socialMediaLinks        : socialMediaLinks,
    roles                   : [String],
    businessType            : {type: mongoose.Schema.ObjectId, ref: 'BusinessTypes'},
    businessModelTypes      : [{type: Number, enum: Object.values(constants.businessModelTypes)}],
    ownershipType           : {type: Number, vaild: Object.values(constants.businessOwnershipTypes)},

    noOfCustomersFollowing  : {type: Number, default: 0},

    isAdminVerified         : { type: Boolean, default: false, index: true },
    isBlocked               : {type: Boolean, default: false, index: true},
    isDeleted               : {type: Boolean, index: true},
    isEmailVerified         : {type: Boolean, default: false, index: true},
    isPhoneVerified         : {type: Boolean, default: false, required: true, index: true},
    emailVerificationToken  : String,
    phoneVerificationToken  : Number, // OTP

    lastActivityAt          : Date,
    userTracking            : {
        platform            : {type: String, enum: ['android', 'ios', 'web']},
        appVersion          : String,
        lastAppOpenedAt     : Date,
    }
}, {timestamps: true, read: 'primaryPreferred', useNestedStrict: true});

const ServiceProvider       = mongoose.model('ServiceProvider', serviceProviderSchema);

module.exports              = ServiceProvider;