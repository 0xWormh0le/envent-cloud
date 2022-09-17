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
    required: [true, 'Provider mapId is required']
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
const mapSchema = new mongoose.Schema(
  {
    mapName: {
      type: String,
      unique: true,
      trim: true,
      required: [true, 'MapName is required'],
      match: [
        /^[a-zA-Z0-9.\-_ ]{4,30}$/,
        'Must be between 4 to 30 characters and may contain only alphanumeric chacracters, hyphen, blankspace, dot or underscore'
      ]
    },
    mapSVG: { type: String, trim: true },
    mapData: { type: String, trim: true }
  },
  { timestamps: true }
);

mapSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

/**
 * @returns {object} The map object
 */
mapSchema.methods.toMapJson = function() {
  return _.pick(this, [
    '_id',
    'mapName',
    'mapSVG',
    'mapData',
    'createdAt',
    'updatedAt'
  ]);
};

/**
 * Set subId to this user.
 * Invalidate all existing JWT tokens
 *
 */
mapSchema.methods.setSubId = function() {
  this.subId = new mongoose.Types.ObjectId().toHexString();
};

/**
 * Determine whether this user has a permission to do given action
 * based on user role and user permissions
 *
 * @param {string} action The action such as debug, deleteUsers,...
 * @returns {boolean} True if this user has permission to perform the given action.
 * Otherwise, false
 */

mapSchema.methods.can = function(action) {
  if (this.role === 'admin' || this.role === 'root') {
    return true;
  }
  return !!this.permissions[action];
};

mongoose.model('Map', mapSchema);
