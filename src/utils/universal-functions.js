'use strict'

const convertToAlphaNumeric =  str => str.replace(/[^0-9a-z]/gi, '')

const convertDaysToSeconds = noOfDays => noOfDays * 86400 // 60 * 60 * 24


module.exports              = {
    convertToAlphaNumeric,
    convertDaysToSeconds
}