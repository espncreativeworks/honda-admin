'use strict';

var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Upload = mongoose.model('Upload');

// Clear old users, then add a default user

// User.find({}).remove(function() {
//   User.create({
//     provider: 'local',
//     name: 'Test User',
//     email: 'test@test.com',
//     password: 'test'
//   }, function() {
//       console.log('finished populating users');
//     }
//   );
// });
