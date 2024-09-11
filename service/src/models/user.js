"use strict";

const mongoose = require('mongoose')
  , moment = require('moment')
  , Authentication = require('./authentication')
  , AuthenticationConfiguration = require('./authenticationconfiguration')
  , { pageQuery } = require('../adapters/base/adapters.base.db.mongoose')
  , { pageOf } = require('../entities/entities.global')
  , FilterParser = require('../utilities/filterParser');


exports.transform = DbUserToObject;

// Creates the Model for the User Schema
const User = mongoose.model('User', UserSchema);
exports.Model = User;

exports.getUserById = function (id, callback) {
  let result = User.findById(id).populate('roleId').populate({ path: 'authenticationId', populate: { path: 'authenticationConfigurationId' } });
  if (typeof callback === 'function') {
    result = result.then(
      user => {
        callback(null, user);
      },
      err => {
        callback(err);
      });
  }
  return result;
};

exports.getUserByUsername = function (username, callback) {
  User.findOne({ username: username.toLowerCase() }).populate('roleId').populate({ path: 'authenticationId', populate: { path: 'authenticationConfigurationId' } }).exec(callback);
};

exports.getUserByAuthenticationId = function (id, callback) {
  User.findOne({ authenticationId: id }).populate('roleId').populate({ path: 'authenticationId', populate: { path: 'authenticationConfigurationId' } }).exec(callback);
}

exports.getUserByAuthenticationStrategy = function (strategy, uid, callback) {
  Authentication.getAuthenticationByStrategy(strategy, uid, function (err, authentication) {
    if (err || !authentication) return callback(err);

    User.findOne({ authenticationId: authentication._id }).populate('roleId').populate({ path: 'authenticationId', populate: { path: 'authenticationConfigurationId' } }).exec(callback);
  });
}

function createQueryConditions(filter) {
  const conditions = FilterParser.parse(filter);

  if (filter.active) {
    conditions.active = filter.active == 'true';
  }
  if (filter.enabled) {
    conditions.enabled = filter.enabled == 'true';
  }

  return conditions;
};

exports.count = function (options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  options = options || {};
  const filter = options.filter || {};

  const conditions = createQueryConditions(filter);

  User.count(conditions, function (err, count) {
    callback(err, count);
  });
};

exports.getUsers = async function (options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  options = options || {};
  const filter = options.filter || {};

  const conditions = createQueryConditions(filter);

  let baseQuery = User.find(conditions).populate({ path: 'authenticationId', populate: { path: 'authenticationConfigurationId' } });

  if (options.lean) {
    baseQuery = baseQuery.lean();
  }

  if (options.populate && (options.populate.indexOf('roleId') !== -1)) {
    baseQuery = baseQuery.populate('roleId');
  }

  const isPaging = options.limit != null && options.limit > 0;
  if (isPaging) {
    const limit = Math.abs(options.limit) || 10;
    const start = (Math.abs(options.start) || 0);
    const page = Math.ceil(start / limit);

    const which = {
      pageSize: limit,
      pageIndex: page,
      includeTotalCount: true
    };
    try {
      const counted = await pageQuery(baseQuery, which);
      const users = [];
      for await (const userDoc of counted.query.cursor()) {
        users.push(entityForDocument(userDoc));
      }
      const pageof = pageOf(users, which, counted.totalCount);
      callback(null, users, pageof);
    } catch (err) {
      callback(err);
    }
  } else {
    baseQuery.exec(function (err, users) {
      callback(err, users, null);
    });
  }
};

function entityForDocument(doc) {
  const json = doc.toJSON();
  const entity = {
    ...json,
    id: doc._id.toHexString()
  }

  return entity;
}

exports.createUser = function (user, callback) {
  Authentication.createAuthentication(user.authentication).then(authentication => {
    const newUser = {
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      phones: user.phones,
      active: user.active,
      roleId: user.roleId,
      avatar: user.avatar,
      icon: user.icon,
      authenticationId: authentication._id
    };

    User.create(newUser, function (err, user) {
      if (err) return callback(err);

      user.populate({ path: 'roleId', path: 'authenticationId', populate: { path: 'authenticationConfigurationId' } }, function (err, user) {
        callback(err, user);
      });
    });
  }).catch(err => callback(err));
};

exports.updateUser = function (user, callback) {
  user.save(function (err, user) {
    if (err) return callback(err);

    user.populate({ path: 'roleId', path: 'authenticationId', populate: { path: 'authenticationConfigurationId' } }, function (err, user) {
      callback(err, user);
    });
  });
};

exports.deleteUser = function (user, callback) {
  user.remove(function (err, removedUser) {
    callback(err, removedUser);
  });
};

exports.invalidLogin = async function (user) {
  const local = await AuthenticationConfiguration.getConfiguration('local', 'local');
  const { accountLock = {} } = local.settings;

  if (!accountLock.enabled) return user;

  const authentication = user.authentication;
  const invalidLoginAttempts = authentication.security.invalidLoginAttempts + 1;
  if (invalidLoginAttempts >= accountLock.threshold) {
    const numberOfTimesLocked = authentication.security.numberOfTimesLocked + 1;
    if (numberOfTimesLocked >= accountLock.max) {
      user.enabled = false;
      await user.save();

      authentication.security = {};
    } else {
      authentication.security = {
        locked: true,
        numberOfTimesLocked: numberOfTimesLocked,
        lockedUntil: moment().add(accountLock.interval, 'seconds').toDate()
      };
    }
  } else {
    authentication.security.invalidLoginAttempts = invalidLoginAttempts;
    authentication.security.locked = undefined;
    authentication.security.lockedUntil = undefined;
  }

  await authentication.save();
};

exports.validLogin = async function (user) {
  user.authentication.security = {};
  await user.authentication.save();
};

exports.setRoleForUser = function (user, role, callback) {
  const update = { role: role };
  User.findByIdAndUpdate(user._id, update, { new: true }, function (err, user) {
    callback(err, user);
  });
};

exports.removeRolesForUser = function (user, callback) {
  const update = { roles: [] };
  User.findByIdAndUpdate(user._id, update, { new: true }, function (err, user) {
    callback(err, user);
  });
};

exports.removeRoleFromUsers = function (role, callback) {
  User.updateMany({ role: role._id }, { roles: undefined }, function (err, number) {
    callback(err, number);
  });
};

exports.addRecentEventForUser = function (user, event, callback) {
  let eventIds = Array.from(user.recentEventIds);

  // push new event onto front of the list
  eventIds.unshift(event._id);

  // remove duplicates
  eventIds = eventIds.filter(function (eventId, index) {
    return eventIds.indexOf(eventId) === index;
  });

  // limit to 5
  if (eventIds.length > 5) {
    eventIds = eventIds.slice(0, 5);
  }

  User.findByIdAndUpdate(user._id, { recentEventIds: eventIds }, { new: true }, function (err, user) {
    callback(err, user);
  });
};

exports.removeRecentEventForUsers = function (event, callback) {
  const update = {
    $pull: { recentEventIds: event._id }
  };

  User.updateMany({}, update, {}, function (err) {
    callback(err);
  });
};