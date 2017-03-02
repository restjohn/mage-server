var async = require('async')
  , ObservationEvents = require('./events/observation.js')
  , FieldFactory = require('./field')
  , ObservationModel = require('../models/observation');

var fieldFactory = new FieldFactory();

function Observation(event, user, deviceId) {
  this._event = event;
  this._user = user;
  this._deviceId = deviceId;
}

var EventEmitter = new ObservationEvents();
Observation.on = EventEmitter;

Observation.prototype.getAll = function(options, callback) {
  var event = this._event;
  var filter = options.filter;
  if (filter && filter.geometries) {
    var allObservations = [];
    async.each(
      filter.geometries,
      function(geometry, done) {
        options.filter.geometry = geometry;
        ObservationModel.getObservations(event, options, function (err, observations) {
          if (err) return done(err);

          if (observations) {
            allObservations = allObservations.concat(observations);
          }

          done();
        });
      },
      function(err) {
        callback(err, allObservations);
      }
    );
  } else {
    ObservationModel.getObservations(event, options, callback);
  }
};

Observation.prototype.getById = function(observationId, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  ObservationModel.getObservationById(this._event, observationId, options, callback);
};

Observation.prototype.validate = function(observation) {
  if (!observation.type || observation.type !== 'Feature' ) {
    throw new Error("cannot create observation 'type' param not specified, or is not set to 'Feature'");
  }

  if (!observation.geometry) {
    throw new Error("cannot create observation 'geometry' param not specified");
  }

  if (!observation.properties.timestamp) {
    throw new Error("cannot create observation 'properties.timestamp' param not specified");
  }

  if (!observation.properties.type) {
    throw new Error("cannot create observation 'properties.type' param not specified");
  }

  // Don't validate archived fields
  this._event.form.fields.filter(function(fieldDefinition) {
    return !fieldDefinition.archived;
  }).forEach(function(fieldDefinition) {
    var field = fieldFactory.createField(fieldDefinition, observation);
    field.validate();
  });
};

Observation.prototype.create = function(observation, callback) {
  if (this._user) observation.userId = this._user._id;
  if (this._deviceId) observation.deviceId = this._deviceId;

  try {
    this.validate(observation);
  } catch (err) {
    err.status = 400;
    return callback(err);
  }

  var self = this;
  ObservationModel.createObservation(this._event, observation, function(err, observation) {
    if (!err) {
      EventEmitter.emit(ObservationEvents.events.add, observation.toObject(), self._event, self._user);
    }

    callback(err, observation);
  });
};

Observation.prototype.update = function(observationId, observation, callback) {
  if (this._user) observation.userId = this._user._id;
  if (this._deviceId) observation.deviceId = this._deviceId;

  try {
    this.validate(observation);
  } catch (err) {
    err.status = 400;
    return callback(err);
  }

  var self = this;
  ObservationModel.updateObservation(this._event, observationId, observation, function(err, observation) {
    if (!err) {
      EventEmitter.emit(ObservationEvents.events.update, observation.toObject(), self._event, self._user);
    }

    callback(err, observation);
  });
};

Observation.prototype.addFavorite = function(observationId, user, callback) {
  ObservationModel.addFavorite(this._event, observationId, user, callback);
};

Observation.prototype.removeFavorite = function(observation, user, callback) {
  ObservationModel.removeFavorite(this._event, observation, user, callback);
};

Observation.prototype.addImportant = function(observationId, important, callback) {
  ObservationModel.updateObservation(this._event, observationId, {important: important}, callback);
};

Observation.prototype.removeImportant = function(observation, callback) {
  ObservationModel.removeImportant(this._event, observation, callback);
};

Observation.prototype.addState = function(observationId, state, callback) {
  var self = this;

  ObservationModel.addState(this._event, observationId, state, function(err, state) {
    if (!err) {
      if (state.name === 'archive') {
        EventEmitter.emit(ObservationEvents.events.remove, observationId, self._event);
      }
    }

    callback(err, state);
  });
};

module.exports = Observation;
