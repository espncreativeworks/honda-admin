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

    console.log('---------------------------');
    console.log(util.inspect(data));
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
    console.log(util.inspect(upload));
    res.json(upload);
  });
};

/**
 *  List Uploads
 */
exports.list = function (req, res, next) {
  Upload.find(function (err, uploads) {
    if (err) return next(err);
    if (!uploads) return res.send(404);

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
