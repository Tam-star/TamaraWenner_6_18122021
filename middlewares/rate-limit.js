
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message:
        "Too many attempts, please try to login again in 30 minutes"
});

module.exports = loginLimiter;