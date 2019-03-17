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
    name                    : {type: String, required: true, trim: true},
    handle                  : {type: String, required: true, index: true},
    imageUrl                : String,
    description             : String,
    googleLocation          : googleLocation,
    socialMediaLinks        : socialMediaLinks,

    businessType            : {type: mongoose.Schema.ObjectId, ref: 'BusinessTypes'},
    businessModelTypes      : {type: Array, enum: Object.values(constants.businessModelTypes)},
    ownershipType           : {type: String, enum: Object.values(constants.businessModelTypes)},

    noOfCustomersFollowing  : {type: Number, default: 0},

    isAdminVerified         : { type: Boolean, default: false, index: true }
}, {timestamps: true});

const customerSchema        = mongoose.Schema({
    firstName               : {type: String, trim: true},
    lastName                : {type: String, trim: true},
    handle                  : String,
    bio                     : String,

    referrer                : String, // userId which could be customer or serviceprovider also
    gender                  : String,
    dob                     : Date,
    socialMediaLinks        : socialMediaLinks,
    googleLocation          : googleLocation,
    businessInterests       : [{type: mongoose.Schema.ObjectId, ref: 'BusinessTypes'}],
    noOfBusinessesFollowed  : {type: Number, default: 0}
}, {timestamps: true})

const userSchema            = mongoose.Schema({
    email                   : {type: String, index: true, trim: true, lowercase: true},
    phoneNumber             : {type: String, index: true, trim: true},
    extention               : {type: String, index: true, trim: true},
    password                : String,
    facebookId              : String,
    googleId                : String,

    serviceProvider         : {type: serviceProviderSchema},
    customer                : {type: customerSchema},
    roles                   : [String],
    currentRole             : { type: String, default: null, index: true },

    isBlocked               : { type: Boolean, default: false, required: true, index: true },
    isDeleted               : { type: Boolean, index: true },
    emailVerificationToken  : String,
    isEmailVerified         : { type: Boolean, default: false, required: true, index: true },
    phoneVerificationToken  : Number, // OTP
    isPhoneVerified         : { type: Boolean, default: false, required: true, index: true },

    fcmToken                : {
        android             : String,
        ios                 : String,
        web                 : String
    },
    lastActivityAt          : {type: Date, default: Date.now},
    userTracking            : {
        platform            : {type: String, enum: ['android', 'ios', 'web']},
        appVersion          : String,
        lastAppOpenedAt     : Date,
    }
}, {timestamps: true, read: 'primaryPreferred', useNestedStrict: true});

const User                  = mongoose.model('User', userSchema);

module.exports              = User;