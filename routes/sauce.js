const express = require('express');

const router = express.Router();
const sauceCtrl = require('../controllers/sauce')
//const auth = require('../middleware/auth');

const multer = require('../middlewares/multer-config');


router.get('/', sauceCtrl.getAllSauces);
router.post('/', multer,  sauceCtrl.createSauce);
router.get('/:id', sauceCtrl.getOneSauce);
router.put('/:id', multer, sauceCtrl.modifySauce);
router.delete('/:id', sauceCtrl.deleteSauce);
router.post('/:id', sauceCtrl.updateLikeSauce);


module.exports = router;