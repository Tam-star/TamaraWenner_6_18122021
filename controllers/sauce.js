const Sauce = require('../models/sauce');
const fs = require('fs');

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }))
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};


exports.createSauce = (req, res, next) => {
    try {
        const sauceObject = JSON.parse(req.body.sauce)
        delete sauceObject._id;
        const sauce = new Sauce({
            ...sauceObject,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        })
        sauce.save()
            .then(() => res.status(201)
                .json({ message: 'You added a sauce !' }))
            .catch(error => res.status(400).json({ error }))
        console.log(req.body);
    } catch (e) {
        return res.status(500).json({ message: e.message })
    }

};



exports.modifySauce = (req, res, next) => {
    try {
        //Catch CastError
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(404).json({ error: 'Wrong id' })
        }
        //Prevent someone from changing its likes 
        if (req.body.likes || req.body.dislikes || req.body.usersLiked || req.body.usersDisliked) {
            return res.status(403).json({ error: 'Forbidden request' })
        }
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                if (!sauce) {
                    return res.status(404).json({ error: 'Wrong id' })
                }
                //Get the userId created in the middleware auth and compare it to the userId of the person who created the sauce
                if (sauce.userId !== req.auth.userId) {
                    return res.status(403).json({ error: 'Forbidden request' })
                }
                const sauceObject = req.file ? {
                    ...JSON.parse(req.body.sauce),
                    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                } : { ...req.body }

                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'The sauce has been modified !' }))
                    .catch(error => res.status(400).json({ error }));
            })
            .catch(error => res.status(400).json("Bad request"))
    } catch (e) {
        return res.status(500).json({ message: e.message })
    }

};


exports.deleteSauce = (req, res, next) => {

    //Catch CastError if someone tries to invent an id which cannot be a MongoDB ObjectId 
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).json({ error: 'Wrong id' })
    }
    Sauce.findOne({ _id: req.params.id }).then(
        sauce => {
            if (!sauce) {
                return res.status(404).json({ error: 'Wrong id' })
            }
            //Get the userId created in the middleware auth
            if (sauce.userId !== req.auth.userId) {
                return res.status(403).json({ error: 'Forbidden request' })
            }
            const filename = sauce.imageUrl.split('/images/')[1]
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Deleted sauce !' }))
                    .catch(error => res.status(400).json({ error }));
            })

        }
    ).catch(error => {
        console.log("Error  : " + error)
        res.status(400).json("Bad request")
    })
};


exports.updateLikeSauce = (req, res, next) => {
    //Check that request has a userID 
    if(!req.body.userId)
    {
        return res.status(400).json({ error: 'Invalid request' })
    }
    //Catch CastError
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).json({ error: 'Wrong id' })
    }
    let userId = req.body.userId

    //Get the data from the sauce to find out if the user has already liked it or disliked it
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (!sauce) {
                return res.status(404).json({ error: 'Wrong id' })
            }
            //If the user likes the sauce
            if (req.body.like === 1) {
                //The user already liked the sauce
                if (sauce.usersLiked.includes(userId)) {
                    res.status(208).json({ message: 'You already liked the sauce !' })
                }
                //The user disliked the sauce before
                else if (sauce.usersDisliked.includes(userId)) {
                    Sauce.updateOne({
                        _id: req.params.id
                    },
                        {
                            $addToSet: { usersLiked: userId },
                            $pull: { usersDisliked: userId },
                            $inc: { likes: 1, dislikes: -1 }
                        }
                    )
                        .then(() => res.status(200).json({ message: 'Like added ! It seems you changed your mind' }))
                        .catch(error => res.status(400).json({ error }));
                }
                //The user did not vote on like or dislike before
                else {
                    Sauce.updateOne({
                        _id: req.params.id
                    },
                        {
                            $addToSet: { usersLiked: userId },
                            $inc: { likes: 1 }
                        }
                    )
                        .then(() => res.status(200).json({ message: 'Like added' }))
                        .catch(error => res.status(400).json({ error }));
                }

            }
            //If the user cancel his like or dislike
            else if (req.body.like === 0) {
                //The user cancel his like
                if (sauce.usersLiked.includes(userId)) {
                    Sauce.updateOne({
                        _id: req.params.id
                    }, {
                        $pull: { usersLiked: userId, usersDisliked: userId },
                        $inc: { likes: -1 }
                    })
                        .then(() => res.status(200).json({ message: 'Like removed' }))
                        .catch(error => res.status(400).json({ error }));
                }
                //The user cancel his dislike
                else if (sauce.usersDisliked.includes(userId)) {
                    Sauce.updateOne({
                        _id: req.params.id
                    }, {
                        $pull: { usersLiked: userId, usersDisliked: userId },
                        $inc: { dislikes: -1 }
                    })
                        .then(() => res.status(200).json({ message: 'Dislike removed' }))
                        .catch(error => res.status(400).json({ error }));
                }
                else {
                    res.status(208).json({ message: 'No changes' })
                }

            }
            //User doesn't like the sauce
            else if (req.body.like === -1) {
                if (sauce.usersDisliked.includes(userId)) {
                    res.status(208).json({ message: 'You already don\'t like the sauce' })
                }
                else if (sauce.usersLiked.includes(userId)) {
                    Sauce.updateOne({
                        _id: req.params.id
                    },
                        {
                            $addToSet: { usersDisliked: userId },
                            $pull: { usersLiked: userId },
                            $inc: { likes: -1, dislikes: 1 }
                        }
                    )
                        .then(() => res.status(200).json({ message: 'Dislike added ! It seems you changed your mind' }))
                        .catch(error => res.status(400).json({ error }));
                }
                //The user did not like nor dislike the sauce before
                else {
                    Sauce.updateOne({
                        _id: req.params.id
                    },
                        {
                            $addToSet: { usersDisliked: userId },
                            $inc: { dislikes: 1 }
                        }
                    )
                        .then(() => res.status(200).json({ message: 'Dislike added !' }))
                        .catch(error => res.status(400).json({ error }));
                }
            }
            else {
                res.status(400).json('Bad request');
            }

        }
        ).catch(error => res.status(400).json('Bad request') )

}

