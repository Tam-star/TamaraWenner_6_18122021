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
    const sauceObject = JSON.parse(req.body.sauce)
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    })
    sauce.save()
        .then(() => res.status(201)
            .json({ message: 'Sauce enregistrée !' }))
        .catch(error => res.status(400).json({ error }))
    console.log(req.body);
};



exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body }
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
        .catch(error => res.status(400).json({ error }));
};


exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }).then(
        sauce => {
            if (!sauce) {
                return res.status(401).json({ error: 'Cette sauce n\'existe pas' })
            }//On récupère le userId créé dans le middleware auth
            if (sauce.userId !== req.auth.userId) {
                return res.status(403).json({ error: 'Requête non autorisée' })
            }
            const filename = sauce.imageUrl.split('/images/')[1]
            console.log('continue apres')
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
                    .catch(error => res.status(400).json({ error }));
            })

        }
    ).catch(error => {
        console.log("Erreur  : " + error)
        res.status(500).json("Erreur du serveur")


    })
};


exports.updateLikeSauce = (req, res, next) => {
    let userId = req.body.userId
    //On récupère d'abord les données de la sauce pour savoir si l'utilisateur l'a déjà liké ou pas
    Sauce.findOne({ _id: req.params.id }).then(sauce => {
        //Si l'utilisateur aime la sauce
        if (req.body.like === 1) {
            //L'utilisateur avait déjà liké la sauce
            if (sauce.usersLiked.includes(userId)) {
                res.status(208).json({ message: 'Sauce déjà likée !' })
            }
            //L'utilisateur n'aimait pas la sauce avant
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
                    .then(() => res.status(200).json({ message: 'Sauce likée ! Vous avez changé d avis apparemment' }))
                    .catch(error => res.status(400).json({ error }));
            }
            //L'utilisateur n'avait pas encore donné son avis sur la sauce
            else {
                Sauce.updateOne({
                    _id: req.params.id
                },
                    {
                        $addToSet: { usersLiked: userId },
                        $inc: { likes: 1 }
                    }
                )
                    .then(() => res.status(200).json({ message: 'Sauce likée ! Vous n\'aviez pas encore donné votre avis' }))
                    .catch(error => res.status(400).json({ error }));
            }

        }
        //Si l'utilisateur annule son like ou son dislike
        else if (req.body.like === 0) {
            //Si l'utilisateur annule son like
            if (sauce.usersLiked.includes(userId)) {
                Sauce.updateOne({
                    _id: req.params.id
                }, {
                    $pull: { usersLiked: userId, usersDisliked: userId },
                    $inc: { likes: -1 }
                })
                    .then(() => res.status(200).json({ message: 'Vous n\'aimez plus cette sauce' }))
                    .catch(error => res.status(400).json({ error }));
            }
            //Si l'utilisateur annule son dislike
            else if (sauce.usersDisliked.includes(userId)) {
                Sauce.updateOne({
                    _id: req.params.id
                }, {
                    $pull: { usersLiked: userId, usersDisliked: userId },
                    $inc: { dislikes: -1 }
                })
                    .then(() => res.status(200).json({ message: 'Vous ne détestez plus cette sauce' }))
                    .catch(error => res.status(400).json({ error }));
            }
            else {
                res.status(208).json({ message: 'Rien ne change' })
            }

        }
        //L'utilisateur n'aime pas la sauce
        else if (req.body.like === -1) {
            if (sauce.usersDisliked.includes(userId)) {
                res.status(208).json({ message: 'Sauce déjà dislikée !' })
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
                    .then(() => res.status(200).json({ message: 'Sauce dislikée ! Vous avez changé d avis apparemment' }))
                    .catch(error => res.status(400).json({ error }));
            }
            //Lorsque la personne n'avait pas encore donné son avis sur la sauce
            else {
                Sauce.updateOne({
                    _id: req.params.id
                },
                    {
                        $addToSet: { usersDisliked: userId },
                        $inc: { dislikes: 1 }
                    }
                )
                    .then(() => res.status(200).json({ message: 'Sauce dislikée ! Vous n\'aviez pas encore donné votre avis' }))
                    .catch(error => res.status(400).json({ error }));
            }
        }
        else {
            res.status(400).json('Il y a une erreur');
        }

    }
    )

}

