// const async = require('async')
//   , User = require('../models/user');

exports.id = '007-user-icon';

/**
 * This migration became obsolete after removing the `type` property from the user icon document.
 */
exports.up = function(done) {
  done();

  // this.log('updating user icons');
  // // TODO: users-next
  // User.getUsers(function(err, users) {
  //   if (err) return done(err);

  //   async.each(users, function(user, done) {
  //     user.icon = user.icon || {};
  //     user.icon.type = user.icon.relativePath ? 'upload' : 'none';
  //     user.save(done);
  //   }, function(err) {
  //     done(err);
  //   });
  // });
};

exports.down = function(done) {
  done();
};
