'use strict';

var fs = require('fs'),
    path = require('path'),
    viewsDir = path.resolve(__dirname, '../../views/')

    if (process.env.NODE_ENV === 'development'){
      viewsDir = path.resolve(__dirname, '../../app/views/');
    };

/**
 * Send partial, or 404 if it doesn't exist
 */
exports.partials = function(req, res) {
  var stripped = req.url.split('.')[0];
  var requestedView = path.join(viewsDir, stripped + '.html');
  fs.readFile(requestedView, function(err, html) {
    if(err) {
      console.log("Error rendering partial '" + requestedView + "'\n", err);
      res.status(404);
      res.send(404);
    } else {
      res.send(200, html.toString());
    }
  });
};

/**
 * Send our single page app
 */
exports.index = function(req, res) {
  var requestedView = path.join(viewsDir, 'index' + '.html');
  fs.readFile(requestedView, function(err, html){
    if(err) {
      console.log("Error rendering partial '" + requestedView + "'\n", err);
      res.status(404);
      res.send(404);
    } else {
      res.send(html.toString());
    }
  });
};
