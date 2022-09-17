const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const uuidv4 = require('uuid/v4');
const config = require('../config');

// By defaulf, we don't store oauth access_token and refresh_token
const providerDataSchema = new mongoose.Schema({
  mapId: {
    type: String,
    required: [true, 'Provider adId is required']
  },
  accessToken: {
    type: String
  },
  refreshToken: {
    type: String
  },
  picture: {
    type: String
  }
});

// Define Schema
const adSchema = new mongoose.Schema(
  {
    adName: {
      type: String,
      unique: true,
      trim: true,
      required: [true, 'adName is required'],
      match: [
        /^[a-zA-Z0-9.\-_ ]{4,30}$/,
        'Must be between 4 to 30 characters and may contain only alphanumeric chacracters, hyphen, blankspace, dot or underscore'
      ]
    },
    adFile: { type: String, trim: true },
    created: { type: String, trim: true }
  },
  { timestamps: true }
);

/**
 * @returns {object} The map object
 */
mapSchema.methods.toAdsJson = function() {
  return _.pick(this, [
    '_id',
    'adName',
    'fileName',
    'created',
    'createdAt',
    'updatedAt'
  ]);
};

/**
 * Set subId to this user.
 * Invalidate all existing JWT tokens
 *
 */
adSchema.methods.setSubId = function() {
  this.subId = new mongoose.Types.ObjectId().toHexString();
};

/**
 * Determine whether this user has a permission to do given action
 * based on user role and user permissions
 *
 * @param {string} action The action such as debug, deleteUsers,...
 * @returns {boolean} True if this user has permission to perform the given action.
 * Otherwise, false

 mapSchema.methods.can = function(action) {
  if (this.role === 'admin' || this.role === 'root') {
    return true;
  }
  return !!this.permissions[action];
};
 */

mongoose.model('Ad', adSchema);
