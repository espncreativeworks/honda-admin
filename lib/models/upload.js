'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * File Schema
 */
var FileSchema = new Schema({
  fileId: { type: String, index: true }, // Result File ID,
  name: String,
  basename: String,
  ext: String,
  size: Number,
  mime: String,
  type: String,
  url: String,
  ssl_url: String,
  width: Number,
  height: Number,
  thumb_index: Number
});

/**
 * Upload Schema
 */
var UploadSchema = new Schema({
  uploadId: { type: String, index: true }, // Assembly ID
  md5hash: { type: String, index: true }, // Original file's checksum
  uploadedAt: Date,
  createdAt: Date,
  modifiedAt: Date,
  mime: String,
  ext: String,
  size: Number,
  duration: Number,
  device: {
    vendor: String,
    name: String,
    software: String
  },
  client : {
    userAgent: String,
    ip: String,
    referrer: String
  },
  loc: [{ type: Number, index: '2d' }],
  userId: String,
  username: String,
  userAccountId: String,
  description: String,
  twitterCards: {
    summary: String,
    player: String
  },
  videos: [FileSchema],
  thumbnails: [FileSchema],
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true }
});

mongoose.model('Upload', UploadSchema);
