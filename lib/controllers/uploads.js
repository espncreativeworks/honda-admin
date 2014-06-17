'use strict';

var mongoose = require('mongoose'),
    Upload = mongoose.model('Upload'),
    UploadHelper = require('../helpers/uploads'),
    passport = require('passport'),
    _ = require('lodash'),
    util = require('util');

/**
 * Create Upload
 */
exports.create = function (req, res, next) {
  var transloadit = JSON.parse(req.body.transloadit);
  var results = transloadit.results;
  var fields = transloadit.fields;
  var steps = _.omit(results, 'files');
  var fittedData = UploadHelper.fitToSchema(transloadit);
  var files = [];
  var data;
  var upload;

  if (transloadit.error){
    res.json(400, { error: transloadit.error });
  }

  //console.info(util.inspect(transloadit));
  //console.log('---------------------------');
  //console.info(util.inspect(steps));

  Object.keys(steps).forEach(function(step){
    var results = steps[step];
    results.forEach(function(result){
      var _file = UploadHelper.fitToSchema(result);
      files.push(_file);
    });
  });

  files.forEach(function(file){
    if (file.type === 'video'){
      fittedData.videos.push(file);
    } else if (file.type === 'image') {
      fittedData.thumbnails.push(file);
    }
  });

  upload = new Upload(fittedData);

  upload.save(function(err){
    if (err){
      res.json(500, err);
    }

    data = {
      uploadId: upload.uploadId,
      files: _.map(upload.videos.concat(upload.thumbnails), function(file, key){
        return {
          fileId: file.fileId,
          name: file.name,
          type: file.type,
          url: file.url
        };
      })
    };

    //console.log('---------------------------');
    //console.log(util.inspect(data));
    res.json(201, data);
  });

};

/**
 *  Get specified Upload
 */
exports.show = function (req, res, next) {
  var uploadId = req.params.id;

  Upload.findOne({ uploadId: uploadId }, function (err, upload) {
    if (err) return next(err);
    if (!upload) return res.send(404);
    //console.log(util.inspect(upload));
    res.json(upload);
  });
};

/**
 *  Get specified Upload
 */
exports.showMultiple = function (req, res, next) {
  var query, uploadIds, projection;

  uploadIds = req.param('ids').split(',').map(function(id){
    return id.toString().trim();
  });

  projection = {
    uploadId: { $in: uploadIds }
  };

  query = Upload.find(projection).sort('-createdAt');

  query.exec(function (err, uploads) {
    if (err) return next(err);
    if (!uploads) return res.send(404);
    //console.log(util.inspect(upload));
    res.json(uploads);
  });
};

/**
 * Remove secified Upload
 */
exports.remove = function(req, res, next) {
  var uploadId = req.params.id;

  Upload.remove({ uploadId: uploadId }, function(err){
    if (err) return next(err);
    res.send(200);
  });
};

/**
 *  List Uploads
 */
exports.list = function (req, res, next) {
  var page = req.param('page') || 1;
  var rpp = req.param('rpp') || 10;
  var projection = {
    videos: { $ne: [] },
    thumbnails: { $ne: [] }
  };

  var query = Upload.find(projection)
    .sort('-createdAt')
    .skip((page - 1) * rpp)
    .limit(rpp);

  query.exec(function (err, uploads) {
    if (err) return next(err);
    if (!uploads) return res.send(404);

    var result = {
      page: page,
      rpp: rpp,
      results: uploads
    };

    res.json(result);
  });
};

/**
 *  List uploads by a specified user
 */
exports.listByUserId = function (req, res, next) {
  var userId = req.params.id;
  var page = req.param('page') || 1;
  var rpp = req.param('rpp') || 10;
  var projection = {
    userId: userId,
    videos: { $ne: [] },
    thumbnails: { $ne: [] }
  };

  var query = Upload.find(projection)
    .sort('-createdAt')
    .skip((page - 1) * rpp)
    .limit(rpp);

  query.exec(function (err, uploads) {
    if (err) return next(err);
    if (!uploads) return res.send(404);

    var result = {
      page: page,
      rpp: rpp,
      results: uploads
    };

    res.json(result);
  });

};

/**
 *  List featured uploads
 */
exports.listFeatured = function (req, res, next) {
  var projection = {
    featured: true,
    videos: { $ne: [] },
    thumbnails: { $ne: [] }
  };

  var query = Upload.find(projection).sort('-createdAt');

  query.exec(function (err, uploads) {
    if (err) return next(err);
    //if (!uploads) return res.send(404);

    var result = {
      results: uploads
    };

    res.json(result);
  });

};

/**
 *  List featured uploads
 */
exports.toggleFeatured = function (req, res, next) {
  var projection = {
    uploadId: req.params.id
  };

  var query = Upload.findOne(projection);

  query.exec(function (err, upload) {
    if (err) return next(err);
    //if (!uploads) return res.send(404);

    upload.featured = !upload.featured;

    upload.save(function(err){
      if (err) return next(err);
      res.json(200, upload);
    });

  });

};
