'use strict';

module.exports = {
  env: 'development',
  port: process.env.PORT || 9000,
  mongo: {
    uri: 'mongodb://localhost/honda-admin'
  }
};
