const mongoose = require('mongoose');
const createError = require('http-errors');
const Joi = require('@hapi/joi');
const _ = require('lodash');
const constants = require('./constants');

const Ad = mongoose.model('Ad');

/**
 * Joi schema for validating getAds query
 */
const getAdsSchema = Joi.object({
  sort: Joi.string()
    .trim()
    .pattern(/^(-?[A-Za-z]+)( -?[A-Za-z]+)*$/), // matches "-descFieldName ascFieldName"
  limit: Joi.number()
    .integer()
    .default(30),
  skip: Joi.number()
    .integer()
    .default(0),
  adName: Joi.string().trim()
});

/**
 * @function getAds
 * Get ads controller
 *
 * @param {string} [req.query.sort] The sort order string. It must be a space
 * delimited list of path names. The sort order of each path is ascending
 * unless the path name is prefixed with "-" which will be treated as descending.
 * @param {number} [req.query.limit] The limit number (default: 30)
 * @param {number} [req.query.skip] The skip number (default: 0)
 * @param {string} [req.query.adName] The adName
 */
module.exports.getAds = (req, res, next) => {
  getAdsSchema
    .validateAsync(req.query)
    .then(payload => {
      console.log('-- getAds : start');
      req.query = payload;
      const query = _.pick(req.query, ['adName']);
      return Promise.all([
        Ad.find(query)
          .sort(req.query.sort)
          .limit(req.query.limit)
          .skip(req.query.skip)
          .exec(),
        Ad.find(query).countDocuments()
      ]);
    })
    .then(results => {
      const [ads, adsCount] = results;
      res.status(200).json({ ads: ads.map(ad => ad.toMapJson()), adsCount });
    })
    .catch(next);
};

/**
 * @function preloadTargetMap
 * Preload the target map object and assign it to res.locals.targetMap.
 *
 * @param {string} adId The target ad ID
 */
module.exports.preloadTargetMap = (req, res, next, adId) => {
  if (!mongoose.Types.ObjectId.isValid(adId)) {
    return next(createError(422, 'Invalid ad ID.'));
  }

  Map.findById(adId)
    .then(targetAd => {
      if (!targetAd) {
        throw createError(422, 'Ad ID does not exist.');
      }
      res.locals.targetAd = targetAd;
      next();
    })
    .catch(next);
};

/**
 * @function getAd
 * Get the target ad
 *
 * @param {string} req.params.adId The ad ID
 */
module.exports.getAd = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.adId)) {
    return next(createError(422, 'Invalid ad ID.'));
  }

  Map.findById(req.params.adId)
    .then(ad => {
      if (!ad) {
        throw createError(422, 'Map ID does not exist.');
      }
      res.status(200).send({ map: ad.toMapJson() });
    })
    .catch(next);
};

/**
 * JOI schema for validating createAd payload
 */
const createAdSchema = Joi.object({
  adName: Joi.string().trim(),
  adFile: Joi.string().trim(),
  created: Joi.string().trim()
});

/**
 * @function createAd
 * create ad
 *
 * @param {string} [req.body.adName] The ad name
 * @param {string} [req.body.adFile] The adFile name
 * @param {string} [req.body.created] The date ad was created
 */
module.exports.createAd = (req, res, next) => {
  console.log('-- createAd 1 : ', req);
  if (_.isEmpty(req.body)) {
    return res.status(200).json({ updatedFields: [] });
  }
  console.log('-- createAd 2');
  let newAd;
  createAdSchema
    .validateAsync(req.body, { stripUnknown: true })
    .then(payload => {
      console.log('-- createAd 3');
      req.body = payload;
      newAd = new Map(req.body);
      newAd.save();
      console.log('-- createAd 4');
      res.status(201).json({
        success: true,
        message: 'Advert has been created successfully.',
        ad: newAd
      });
      console.log('-- createMap 5');
    })
    .catch(next);
};

/**
 * JOI schema for validating updateAd payload
 */
const updateAdSchema = Joi.object({
  mapName: Joi.string().trim(),
  mapSVG: Joi.string().trim(),
  mapData: Joi.string().trim()
});

/**
 * @function updateAd
 *
 * @param {string} [req.body.adName] The adName
 * @param {string} [req.body.fileName] The ad file name
 * @param {string} [req.body.created] The ad created date
 */
module.exports.updateAd = (req, res, next) => {
  if (_.isEmpty(req.body)) {
    return res.status(200).json({ updatedFields: [] });
  }
  updateAdSchema
    .validateAsync(req.body, { stripUnknown: true })
    .then(payload => {
      req.body = payload;
      _.merge(res.locals.targetAd, req.body);
      console.log('-- res.locals.targetAd : ', res.locals.targetAd);
      return res.locals.targetAd.save();
    })
    .then(updatedAd => {
      res.status(200).json({
        success: true,
        updatedFields: _.keys(req.body),
        ad: updatedAd
      });
    })
    .catch(next);
};
