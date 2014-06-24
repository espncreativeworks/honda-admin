'use strict';

var mongoose = require('mongoose'),
    Upload = mongoose.model('Upload'),
    _ = require('lodash'),
    util = require('util');


/**
 * Show Player
 */
 exports.player = function (req, res, next) {
   var uploadId = req.params.id;

   Upload.findOne({ uploadId: uploadId }, function (err, upload) {
     if (err) return next(err);
     if (!upload) return res.send(404);
     res.render('twitter-cards/player', upload);
   });
 };
