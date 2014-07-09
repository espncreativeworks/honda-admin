'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
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
 *  Get specified Uploads
 */
exports.showMultiple = function (req, res, next) {
  var query, uploadIds, projection;

  uploadIds = req.param('ids').split(',').map(function(id){
    return id.toString().trim();
  });

  projection = {
    active: true,
    uploadId: { $in: uploadIds }
  };

  query = Upload.find(projection).sort('-uploadedAt');

  query.exec(function (err, uploads) {
    if (err) return next(err);
    if (!uploads) return res.send(404);
    //console.log(util.inspect(upload));
    res.json(uploads);
  });
};

/**
 * Remove specified Upload
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
  var duration = parseInt((req.param('duration') || '30'),10);
  var active = parseInt(req.param('active') || '-1');
  var startDate = parseInt(req.param('sd'),10);
  var endDate = parseInt(req.param('ed'),10);
  var projection = {
    videos: { $ne: [] },
    duration: { $lte: duration },
    thumbnails: { $ne: [] }
  };

  if (active === 1){
    projection.active = true;
  } else if (active === 0){
    projection.active = false;
  }

  if (startDate && !endDate){
    projection.uploadedAt = { $gte: new Date(startDate) };
  } else if (endDate && !startDate){
    projection.uploadedAt = { $lte: new Date(endDate) };
  } else if (startDate && endDate){
    projection.uploadedAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  var query = Upload.find(projection)
    .sort('-uploadedAt')
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
    .sort('-uploadedAt')
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
    active: true,
    featured: true,
    videos: { $ne: [] },
    thumbnails: { $ne: [] }
  };
  var limit = parseInt(req.param('limit'), 10);

  var query = Upload.find(projection).sort('-uploadedAt');

  if (limit && limit > 0){
    query.limit(limit);
  }

  query.exec(function (err, uploads) {
    if (err) return next(err);

    var result = {
      results: uploads
    };

    res.json(result);
  });

};

/**
 *  Toggle featured
 */
exports.toggleFeatured = function (req, res, next) {
  var projection = {
    uploadId: req.params.id
  };

  var query = Upload.findOne(projection);

  query.exec(function (err, upload) {
    if (err) return next(err);

    upload.featured = !upload.featured;
    upload.save(function(err){
      if (err) return next(err);
      res.json(200, upload);
    });

  });

};

/**
 *  Toggle active
 */
exports.toggleActive = function (req, res, next) {
  var projection = {
    uploadId: req.params.id
  };

  var query = Upload.findOne(projection);

  query.exec(function (err, upload) {
    if (err) return next(err);

    upload.active = !upload.active;
    upload.save(function(err){
      if (err) return next(err);
      res.json(200, upload);
    });

  });

};

/**
 *  Analyze Uploads
 */
exports.aggregate = function (req, res, next){

  var query = Upload.aggregate();

  query.append({
    $match: {
      videos: { $ne: [] },
      thumbnails: { $ne: [] }
    }
  });

  query.append({
    $sort: { uploadedAt: 1 }
  });

  query.append({
    $project: {
      _id: 1,
      uploadedAt: 1
    }
  });

  query.append({
    $group: {
      _id: {
        y: { '$year' : '$uploadedAt' },
        m: { '$month' : '$uploadedAt' },
        w: { '$week' : '$uploadedAt' },
        d: { '$dayOfMonth' : '$uploadedAt' }
      },
      count: { '$sum': 1 }
    }
  });

  query.exec(function (err, data) {
    if (err) return next(err);
    if (!data) return res.send(404);

    var result = {
      results: data
    };

    res.json(result);
  });

};
