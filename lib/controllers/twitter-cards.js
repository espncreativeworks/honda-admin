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
     var videos = upload.videos.filter(function(video){
       if (video.width > 480){
         return true;
       }
     });
     upload.videos = videos;
     res.render('twitter-cards/player', upload, function (err, html){
       if (err){
         console.error(err);
         return res.send(500);
       }
       res.send(200, html.toString());
     });
   });
 };
