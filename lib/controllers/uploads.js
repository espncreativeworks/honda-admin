'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Upload = mongoose.model('Upload'),
    UploadHelper = require('../helpers/uploads'),
    fs = require('fs'),
    request = require('request'),
    tmp = require('tmp'),
    zip = require('node-zip')(),
    mime = require('mime'),
    passport = require('passport'),
    _ = require('lodash'),
    events = require('events'),
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
  var page = parseInt(req.param('page') || '1');
  var rpp = parseInt(req.param('rpp') || '10');
  var projection = {
    featured: true,
    videos: { $ne: [] },
    thumbnails: { $ne: [] }
  };

  var query = Upload.find(projection)
    .sort('-uploadedAt')
    .skip((page - 1) * rpp)
    .limit(rpp);

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
 *  List active uploads
 */
exports.listActive = function (req, res, next) {
  var page = parseInt(req.param('page') || '1');
  var rpp = parseInt(req.param('rpp') || '10');
  var projection = {
    active: true,
    videos: { $ne: [] },
    thumbnails: { $ne: [] }
  };

  var query = Upload.find(projection)
    .sort('-uploadedAt')
    .skip((page - 1) * rpp)
    .limit(rpp);

  query.exec(function (err, uploads) {
    if (err) return next(err);

    var result = {
      results: uploads
    };

    res.json(result);
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
  var startDate = new Date(2014,5,1);
  var endDate = new Date(2014,6,31);
  var query = Upload.aggregate();

  query.append({
    $match: {
      uploadedAt: { $gt: startDate, $lt: endDate },
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

/**
 *  Download Upload
 */
exports.download = function (req, res, next) {
  var uploadId = req.params.id;

  Upload.findOne({ uploadId: uploadId }, function (err, upload) {
    if (err) return next(err);
    if (!upload) return res.send(404);

    var video;
    upload.videos.forEach(function(_video){
      if (_video.mime === 'video/mp4' && _video.width > 480){
        video = _video;
      }
    });

    //console.log(util.inspect(video));

    tmp.dir({ prefix: req.sessionID }, function _tempDirCreated(dirErr, dirPath) {
      if (dirErr) return next(dirErr);
      //console.log('Created temp dir: ' + dirPath);

      tmp.file({ dir: dirPath, prefix: video.fileId, postfix: '.' + video.ext }, function _tempFileCreated(fileErr, filePath, fileDescriptor){
        if (fileErr) return next(fileErr);

        //console.log('Created temp file: ' + filePath);
        var dest = fs.createWriteStream(filePath);

        dest.on('finish', function(){
          var filename = video.fileId + '.' + video.ext;
          var data = fs.createReadStream(filePath);
          res.setHeader('Content-disposition', 'attachment; filename=' + filename);
          res.setHeader('Content-type', video.mime);
          data.pipe(res);
        });

        dest.on('error', function(pipeErr){
          return next(pipeErr);
        });

        request(video.ssl_url).pipe(dest);
      });
    });

  });
};

/**
 *  Download Multiple Upload
 */
exports.downloadMultiple = function (req, res, next) {

  var uploadIds = req.param('ids').split(',').map(function(id){
    return id.toString().trim();
  });

  var projection = {
    uploadId: { $in: uploadIds }
  };

  var ZipEventer = function(_files, count){
    events.EventEmitter.call(this);
    this.files = _files || [];
    this.filesToWrite = count;
    this.writtenToDisk = 0;
    this.finished = false;

    this.addFile = function(file){
      this.files.push(file);
      this.writtenToDisk += 1;

      if (this.filesToWrite === this.writtenToDisk){
        this.finished = true;
        this.emit('finished', this.files);
      }
    };

  };

  util.inherits(ZipEventer, events.EventEmitter);

  Upload.find(projection, function (err, uploads) {
    if (err) return next(err);
    if (!uploads) return res.send(404);

    var videos = [];
    var zipEvents = new ZipEventer(null, uploadIds.length);

    uploads.forEach(function(upload){
      upload.videos.forEach(function(video){
        if (video.mime === 'video/mp4' && video.width > 480){
          videos.push(video);
        }
      });
    });

    tmp.dir({ prefix: req.sessionID }, function _tempDirCreated(dirErr, dirPath) {
      if (dirErr) return next(dirErr);
      //console.log('Created temp dir: ' + dirPath);

      videos.forEach(function(video){
        tmp.file({ dir: dirPath, prefix: video.fileId, postfix: '.' + video.ext }, function _tempFileCreated(fileErr, filePath, fileDescriptor){
          if (fileErr) return next(fileErr);

          //console.log('Created temp file: ' + filePath);
          var dest = fs.createWriteStream(filePath);

          dest.on('finish', function(){
            var filename = video.fileId + '.' + video.ext;
            fs.readFile(filePath, function (fileReadErr, data){
              if (fileReadErr) return next(fileReadErr);
              zipEvents.addFile({
                name: filename,
                contents: data
              });
            });
          });

          dest.on('error', function(pipeErr){
            return next(pipeErr);
          });

          request(video.ssl_url).pipe(dest);
        });
      });

      zipEvents.on('finished', function(files){

        files.forEach(function(file){
          zip.file(file.name, file.contents);
        });

        var archive = zip.generate({ base64: false, compression: 'DEFLATE' });
        tmp.file({ dir: dirPath, prefix: Date.now(), postfix: '.zip' }, function _tempZipFileCreated(fileErr, filePath, fileDescriptor){
          if (fileErr) return next(fileErr);
          console.log('Created temp file: ' + filePath);
          fs.writeFile(filePath, archive, { encoding: 'binary' }, function (fileWriteErr) {
            if (fileWriteErr) return next(fileWriteErr);
            var filename = 'honda-videos-' + Date.now() +'.zip';
            var contentType = mime.lookup(filePath);
            var data = fs.createReadStream(filePath);
            res.setHeader('Content-disposition', 'attachment; filename=' + filename);
            res.setHeader('Content-type', contentType);
            data.pipe(res);
          });
        });
      });

    });

  });
};
