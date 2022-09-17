const express = require('express');
const passport = require('passport');
const usersCtr = require('../../controllers/ads.controller');
const createCan = require('../../middleware/createCan');

const router = express.Router();
const canDeleteAds = createCan('deleteAds');
const canReadAds = createCan('readAds');
const canUpdateAds = createCan('updateAds');

router.use(passport.authenticate('jwt', { session: false }));

// Preload user object on routes with ':userId'
router.param('adId', usersCtr.preloadTargetUser);

router.get('/', canReadAds, usersCtr.getAds);

router.get('/:adId', canReadAds, usersCtr.getAd);

router.put('/:adId', canUpdateUsers, usersCtr.updateAd);

router.delete('/:adId', canDeleteAds, usersCtr.deleteAd);

module.exports = router;
