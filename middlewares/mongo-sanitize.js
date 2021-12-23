const mongoSanitize = require('express-mongo-sanitize');


function sanitizer(req, res, next) {

    if (req.file) {
        const sauceObject = {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        }

        mongoSanitize.sanitize(sauceObject, {
            replaceWith: '_'
        });

        req.body.sauce = JSON.stringify(sauceObject)

    } else {
        const sauceObject = { ...req.body }
        mongoSanitize.sanitize(sauceObject, {
            replaceWith: '_'
        });

        req.body.sauce = sauceObject
    }

    next()
}


module.exports = sanitizer;