const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true, validate: [validateEmail, 'Email non valide'] },
    password: { type: String, required: true }
})

//Vérifie l'unicité de l'email
userSchema.plugin(uniqueValidator);

function validateEmail(email) {
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (email.match(mailformat)) {
        return true;
    }
    else {
        return false;
    }
}

module.exports = mongoose.model('User', userSchema)