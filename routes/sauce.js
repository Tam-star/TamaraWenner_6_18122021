const express = require('express');

const router = express.Router();
const sauceCtrl = require('../controllers/sauce')
//const auth = require('../middleware/auth');


router.get('/', sauceCtrl.getAllSauces);
router.post('/', sauceCtrl.createSauce);
router.get('/:id', sauceCtrl.getOneSauce);
router.put('/:id', sauceCtrl.modifySauce);
router.delete('/:id', sauceCtrl.deleteSauce);
router.post('/:id', sauceCtrl.updateLikeSauce);


module.exports = router;