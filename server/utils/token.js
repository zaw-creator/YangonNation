const crypto = require('crypto');
module.exports.generateToken = () => crypto.randomBytes(32).toString('hex');
