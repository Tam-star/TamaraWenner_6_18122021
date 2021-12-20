const mongoose = require('mongoose');

const sauceSchema = mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, required: true },
    mainPepper: { type: String, required: true },
    imageUrl: { type: String, required: true },
    heat: { type: Number, required: true, min: [1, 'Must be at least 1! Otherwise, it\'s not spicy...'],
    max: [10, '10 maximum'] },
    likes: { type: Number, default : 0, min: [0, 'Likes number must be 0 on creation'],
    max: [0, 'Tsss, are you trying to cheat by giving you likes ? ']},
    dislikes: { type: Number, default : 0, min: [0, 'Dislikes number must be 0 on creation'],
    max: [0, 'Dislikes number must be 0 on creation ? ']},
    usersLiked: { type: [String], validate: [arrayLimit, 'It is forbidden to create this array'] },
    usersDisliked: { type: [String], validate: [arrayLimit, 'It is forbidden to create this array']  },
})


function arrayLimit(array) {
    return array.length === 0 ;
  }

module.exports = mongoose.model('Sauce', sauceSchema)