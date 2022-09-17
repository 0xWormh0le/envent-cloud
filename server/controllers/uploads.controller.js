const mongoose = require('mongoose');
const path = require('path');
const createError = require('http-errors');
const Joi = require('@hapi/joi');
const _ = require('lodash');
const constants = require('./constants');

const Map = mongoose.model('Map');


/**
 * JOI schema for validating uploadSVG payload
 */
const uploadSchema = Joi.object({
  file: Joi.string().trim(),
});

/**
 * @function uploadSVG
 * Get profile controller
 *
 * @param {string} [req.body.file] The map name
 */
module.exports.upload = (req, res, next) => {  
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(createError(400, 'No files were uploaded.'));
  }
  let uploadFile = req.files.file;
  let fileName = uploadFile.name
  const uploadDir = path.resolve(__dirname, '../uploads');
  let filePath = uploadDir + '/' + fileName;
  console.log('-- server upload uploadFile : ', uploadFile, filePath)

  // // Use the mv() method to place the file somewhere on your server
  uploadFile.mv(filePath, function(err) {
    if (err) {
      console.log('-- error : ', err)
      return next(createError(500, 'File upload failed.'));
    }
      
    let serverURL = req.getUrl() + 'uploads/' + fileName;
    console.log('-- serverURL : ', serverURL);
    res.status(200).json({ success: true, upload: serverURL });
  });
  // uploadSchema
  //   .validateAsync(req.body, { stripUnknown: true })
  //   .then(payload => {
  //     console.log('-- server upload 1')
  //     req.body = payload;
  //     _.merge(res.locals.targetMap, req.body);
  //     return res.locals.targetMap.save();
  //   })
  //   .then(updatedMap => {
  //     res.status(200).json({ success: true, updatedFields: _.keys(req.body) });
  //   })
  //   .catch(next);
};