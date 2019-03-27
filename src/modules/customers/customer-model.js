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

const customerSchema        = mongoose.Schema({
    email                   : {type: String, index: true, trim: true, lowercase: true},
    phoneNumber             : {type: String, index: true, trim: true},
    extention               : {type: String, index: true, trim: true},
    password                : String,
    facebookId              : String,
    googleId                : String,

    firstName               : {type: String, trim: true},
    lastName                : {type: String, trim: true},
    bio                     : String,
    //referrer                : String, // userId which could be customer or serviceprovider also
    gender                  : String,
    dob                     : Date,
    socialMediaLinks        : [{type: socialMediaLinks, default: void 0}],
    googleLocation          : googleLocation,
    businessInterests       : [{type: mongoose.Schema.ObjectId, ref: 'BusinessSubTypes'}],
    roles                   : [String],
    noOfBusinessesFollowed  : {type: Number, default: 0},

    isBlocked               : {type: Boolean, default: false, index: true},
    isDeleted               : {type: Boolean, index: true},
    isEmailVerified         : {type: Boolean, default: false, index: true},
    isPhoneVerified         : {type: Boolean, default: false, required: true, index: true},
    emailVerificationToken  : String,
    phoneVerificationToken  : Number, // OTP

    lastActivityAt          : Date
}, {timestamps: true, read: 'primaryPreferred', useNestedStrict: true});

const Customer              = mongoose.model('Customer', customerSchema);

module.exports              = Customer;