const bluebird          = require('bluebird'), 
    bcrypt              = bluebird.promisifyAll(require('bcrypt'));

const hashPassword      = async plainTextPassword => {
    const saltRounds    = 10
    return bcrypt.hash(plainTextPassword, saltRounds)
}

const comparePassword   = async (userPass, dbPass) => bcrypt.compare(userPass, dbPass)

module.exports          = {
    hashPassword,
    comparePassword
}