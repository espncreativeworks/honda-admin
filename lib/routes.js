'use strict';

var index = require('./controllers'),
    users = require('./controllers/users'),
    session = require('./controllers/session'),
    uploads = require('./controllers/uploads'),
    twitterCards = require('./controllers/twitter-cards'),
    middleware = require('./middleware');

/**
 * Application routes
 */
module.exports = function(app) {

  // Server API Routes
  app.route('/api/users')
    .post(users.create)
    .put(users.changePassword);

  app.route('/api/users/me')
    .get(users.me);

  app.route('/api/users/:id')
    .get(users.show);

  app.route('/api/uploads')
    .get(uploads.list)
    .post(uploads.create);

  app.route('/api/uploads/featured')
    .get(uploads.listFeatured);

  app.route('/api/uploads/active')
    .get(uploads.listActive);

  app.route('/api/uploads/stats')
    .get(uploads.aggregate);

  app.route('/api/uploads/multi/download/:ids')
    .get(uploads.downloadMultiple);

  app.route('/api/uploads/multi/:ids')
    .get(uploads.showMultiple);

  app.route('/api/uploads/user/:id')
    .get(uploads.listByUserId);

  app.route('/api/uploads/:id/featured')
    .post(uploads.toggleFeatured);

  app.route('/api/uploads/:id/download')
    .get(uploads.download);

  app.route('/api/uploads/:id/active')
    .post(uploads.toggleActive);

  app.route('/api/uploads/:id')
    .get(uploads.show)
    .delete(uploads.remove);

  app.route('/api/session')
    .post(session.login)
    .delete(session.logout);

  // All undefined api routes should return a 404
  app.route('/api/*')
    .get(function(req, res) {
      res.send(404);
    });

  // Twitter Card routes
  app.route('/twitter-cards/player/:id')
    .get(twitterCards.player);

  // All other routes to use Angular routing in app/scripts/app.js
  app.route('/partials/*')
    .get(index.partials);
  app.route('/*')
    .get( middleware.setUserCookie, index.index);
};
