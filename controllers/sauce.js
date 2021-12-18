const Sauce = require('../models/sauce');

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
    delete req.body._id;
    const sauce = new Sauce({
        ...req.body
    })
    sauce.save()
        .then(() => res.status(201)
            .json({ message: 'Sauce enregistrée !' }))
        .catch(error => res.status(400).json({ error }))
    console.log(req.body);
};



exports.modifySauce = (req, res, next) => {
    Sauce.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
        .catch(error => res.status(400).json({ error }));
};


exports.deleteSauce = (req, res, next) => {
    Sauce.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
        .catch(error => res.status(400).json({ error }));
};


exports.updateLikeSauce = (req, res, next) => {
    let userId = req.body.userId
    if (req.body.like === 1) {
        Sauce.updateOne({
            _id: req.params.id
        },
            {
                $addToSet: { usersLiked: userId },
                $pull: { usersDisliked: userId }
            }
        )
            .then(() => res.status(200).json({ message: 'Sauce likée !' }))
            .catch(error => res.status(400).json({ error }));
    }
    else if (req.body.like === 0) {
        Sauce.updateOne({
            _id: req.params.id
        }, { $pull: { usersLiked: userId, usersDisliked: userId } })
            .then(() => res.status(200).json({ message: 'Sauce ni likée ni dislikée !' }))
            .catch(error => res.status(400).json({ error }));
    }
    else if (req.body.like === -1) {
        Sauce.updateOne({
            _id: req.params.id
        },
            {
                $addToSet: { usersDisliked: userId },
                $pull: { usersLiked: userId }
            }
        )
            .then(() => res.status(200).json({ message: 'Sauce dislikée !' }))
            .catch(error => res.status(400).json({ error }));
    }
    else {
        res.status(400).json('Il y a une erreur');
    }
}

