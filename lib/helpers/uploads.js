'use strict';

var _ = require('lodash');
var util = require('util');
var twitterCardBaseUrl = 'http://promo.espn.go.com/espn/contests/honda/2014/perfectplay/twitter_cards';
var twitterCardPlayerUrl = twitterCardBaseUrl + '/player';
var twitterCardSummaryUrl = twitterCardBaseUrl + '/summary';

var fitAssemblyToSchema = function(assembly){
  var uploadMeta, fileMeta, fields, props, originalFile;

  originalFile = _.first(assembly.uploads);
  fileMeta = originalFile.meta;
  fields = assembly.fields || {};
  props = ['md5hash', 'mime', 'ext', 'size', 'fields'];
  uploadMeta = _.pick(originalFile, props);
  uploadMeta = _.merge(uploadMeta, {
    uploadId: assembly.assembly_id,
    uploadedAt: new Date(assembly.notify_start),
    createdAt: new Date(fileMeta.date_file_created),
    modifiedAt: new Date(fileMeta.date_file_created),
    duration: fileMeta.duration,
    client: {
      userAgent: assembly.client_agent,
      ip: assembly.client_ip,
      referrer: assembly.client_referer
    },
    twitterCards: {
      summary: twitterCardSummaryUrl + '?id=' + assembly.assembly_id,
      player: twitterCardPlayerUrl + '?id=' + assembly.assembly_id
    },
    videos: [],
    thumbnails: []
  });
  uploadMeta = _.merge(uploadMeta, fields);

  if (_.has(fileMeta, 'device_vendor') || _.has(fileMeta, 'device_name') || _.has(fileMeta, 'device_software')){
    uploadMeta.device = {};
    if ( _.has(fileMeta.device_vendor) ){ uploadMeta.device.vendor = fileMeta.device_vendor; }
    if ( _.has(fileMeta.device_name) ){ uploadMeta.device.name = fileMeta.device_name; }
    if ( _.has(fileMeta.device_vendor) ){ uploadMeta.device.software = fileMeta.device_software; }
  }

  if ( _.has(fileMeta, 'longitude') && _.has(fileMeta, 'latitude') ){
    uploadMeta.loc = [ fileMeta.longitude, fileMeta.latitude ];
  }

  console.log(util.inspect(uploadMeta));

  return uploadMeta;
};

var fitResultToSchema = function(result){
  var fileCore, fileMeta, props;

  fileMeta = result.meta;
  props = ['id', 'field', 'original_id', 'original_basename', 'original_md5hash', 'meta'];
  fileCore = _.omit(result, props);
  fileCore = _.merge(fileCore, {
    fileId: result.id,
    width: fileMeta.width,
    height: fileMeta.height
  });

  if (_.has(fileMeta, 'thumb_index')){
    fileCore.thumb_index = fileMeta.thumb_index;
  }

  console.log(util.inspect(fileCore));
  return fileCore;
};

exports.fitToSchema = function(result){
  if (_.has(result, 'assembly_id')){
    return fitAssemblyToSchema(result);
  }
  return fitResultToSchema(result);
};

return exports;
