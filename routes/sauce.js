const express = require('express');

const router = express.Router();
const sauceCtrl = require('../controllers/sauce')
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');
const sanitize = require('../middlewares/mongo-sanitize');

router.get('/', auth, sauceCtrl.getAllSauces);
router.post('/', auth,  multer, sanitize, sauceCtrl.createSauce);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.put('/:id', auth, multer, sanitize, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.post('/:id/like', auth, sanitize, sauceCtrl.updateLikeSauce);


module.exports = router;