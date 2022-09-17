const mongoose = require('mongoose');
const createError = require('http-errors');
const Joi = require('@hapi/joi');
const _ = require('lodash');
const constants = require('./constants');

const Map = mongoose.model('Map');


/**
 * Joi schema for validating getMaps query
 */
const getMapsSchema = Joi.object({
  sort: Joi.string()
    .trim()
    .pattern(/^(-?[A-Za-z]+)( -?[A-Za-z]+)*$/), // matches "-descFieldName ascFieldName"
  limit: Joi.number()
    .integer()
    .default(30),
  skip: Joi.number()
    .integer()
    .default(0),
  mapName: Joi.string().trim(),
});

/**
 * @function getMaps
 * Get maps controller
 *
 * @param {string} [req.query.sort] The sort order string. It must be a space
 * delimited list of path names. The sort order of each path is ascending
 * unless the path name is prefixed with "-" which will be treated as descending.
 * @param {number} [req.query.limit] The limit number (default: 30)
 * @param {number} [req.query.skip] The skip number (default: 0)
 * @param {string} [req.query.mapName] The mapName
 */
module.exports.getMaps = (req, res, next) => {
  getMapsSchema
    .validateAsync(req.query)
    .then(payload => {
      console.log('-- getMaps : start')
      req.query = payload;
      const query = _.pick(req.query, [
        'mapName',
      ]);
      return Promise.all([
        Map.find(query)
          .sort(req.query.sort)
          .limit(req.query.limit)
          .skip(req.query.skip)
          .exec(),
        Map.find(query).countDocuments()
      ]);
    })
    .then(results => {
      const [maps, mapsCount] = results;
      res
        .status(200)
        .json({ maps: maps.map(map => map.toMapJson()), mapsCount });
    })
    .catch(next);
};


/**
 * @function preloadTargetMap
 * Preload the target map object and assign it to res.locals.targetMap.
 *
 * @param {string} mapId The target map ID
 */
module.exports.preloadTargetMap = (req, res, next, mapId) => {
  if (!mongoose.Types.ObjectId.isValid(mapId)) {
    return next(createError(422, 'Invalid map ID.'));
  }

  Map.findById(mapId)
    .then(targetMap => {
      if (!targetMap) {
        throw createError(422, 'Map ID does not exist.');
      }
      res.locals.targetMap = targetMap;
      next();
    })
    .catch(next);
};


/**
 * @function getMap
 * Get the target map
 *
 * @param {string} req.params.mapId The map ID
 */
module.exports.getMap = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.mapId)) {
    return next(createError(422, 'Invalid map ID.'));
  }

  Map.findById(req.params.mapId)
    .then(map => {
      if (!map) {
        throw createError(422, 'Map ID does not exist.');
      }
      res.status(200).send({ map: map.toMapJson() });
    })
    .catch(next);
};


/**
 * JOI schema for validating createMap payload
 */
const createMapSchema = Joi.object({
  mapName: Joi.string().trim(),
  mapSVG: Joi.string().trim(),
  mapData: Joi.string().trim()
});

/**
 * @function createMap
 * create Map
 *
 * @param {string} [req.body.mapName] The map name
 * @param {string} [req.body.mapSVG] The svg file url
 * @param {string} [req.body.mapData] The map data
 */
module.exports.createMap = (req, res, next) => {
  console.log('-- createMap 1 : ', req)
  if (_.isEmpty(req.body)) {
    return res.status(200).json({ updatedFields: [] });
  }
  console.log('-- createMap 2')
  let newMap;
  createMapSchema
    .validateAsync(req.body, { stripUnknown: true })
    .then(payload => {
      console.log('-- createMap 3')
      req.body = payload;
      newMap = new Map(req.body);
      newMap.save();
      console.log('-- createMap 4')
      res.status(201).json({
        success: true,
        message: 'Map has been created successfully.',
        map: newMap
      });
      console.log('-- createMap 5')
    })
    .catch(next);
};


/**
 * JOI schema for validating updateMap payload
 */
const updateMapSchema = Joi.object({
  mapName: Joi.string().trim(),
  mapSVG: Joi.string().trim(),
  mapData: Joi.string().trim()
});

/**
 * @function updateMap
 * Get profile controller
 *
 * @param {string} [req.body.mapName] The map name
 * @param {string} [req.body.mapSVG] The svg file url
 * @param {string} [req.body.mapData] The map data
 */
module.exports.updateMap = (req, res, next) => {
  if (_.isEmpty(req.body)) {
    return res.status(200).json({ updatedFields: [] });
  }
  updateMapSchema
    .validateAsync(req.body, { stripUnknown: true })
    .then(payload => {
      req.body = payload;
      _.merge(res.locals.targetMap, req.body);
      console.log('-- res.locals.targetMap : ', res.locals.targetMap)
      return res.locals.targetMap.save();
    })
    .then(updatedMap => {
      res.status(200).json({ 
        success: true, 
        updatedFields: _.keys(req.body),
        map: updatedMap });
    })
    .catch(next);
};


