module.exports = function(app, security) {
  var EventModel = require('../models/event')
  , api = require('../api')
  , access = require('../access')
  , archiver = require('archiver');

  var passport = security.authentication.passport;

  function validateEventAccess(req, res, next) {
    if (access.userHasPermission(req.user, 'READ_LOCATION_ALL')) {
      next();
    } else if (access.userHasPermission(req.user, 'READ_LOCATION_EVENT')) {
      // Make sure I am part of this event
      EventModel.eventHasUser(req.event, req.user._id, function(err, eventHasUser) {
        if (eventHasUser) {
          return next();
        } else {
          return res.sendStatus(403);
        }
      });
    } else {
      res.sendStatus(403);
    }
  }

  function parseEventQueryParams(req, res, next) {
    var parameters = {};

    var state = req.param('state');
    if (!state || state === 'active') {
      parameters.complete = false;
    } else if (state === 'complete') {
      parameters.complete = true;
    }

    parameters.userId = req.param('userId');

    parameters.populate = true;
    if (req.query.populate === 'false') parameters.populate = false;

    var form = req.body.form || {};
    var fields = form.fields || [];
    var userFields = form.userFields || [];
    fields.forEach(function(field) {
      // remove userFields chocies, these are set dynamically
      if (userFields.indexOf(field.name) !== -1) {
        field.choices = [];
      }
    });

    req.parameters = parameters;

    next();
  }

  app.get(
    '/api/events/count',
    passport.authenticate('bearer'),
    access.authorize('READ_EVENT_ALL'),
    function(req, res, next) {
      new api.Event().count(function(err, count) {
        if (err) return next(err);

        return res.json({count: count});
      });
    }
  );

  app.get(
    '/api/events',
    passport.authenticate('bearer'),
    parseEventQueryParams,
    function (req, res, next) {
      var options = {
        filter: {
          complete: req.parameters.complete
        },
        populate: req.parameters.populate
      };
      if (req.parameters.userId) options.filter.userId = req.parameters.userId;

      if (access.userHasPermission(req.user, 'READ_EVENT_ALL')) {
        new api.Event().getEvents(options, function(err, events) {
          if (err) return next(err);

          res.json(events);
        });
      } else if (access.userHasPermission(req.user, 'READ_EVENT_USER')) {
        options.access = {
          userId: req.user._id
        };

        new api.Event().getEvent(options, function(err, events) {
          if (err) return next(err);

          res.json(events);
        });
      } else {
        // No valid READ EVENT permission
        return res.sendStatus(403);
      }
    }
  );

  app.get(
    '/api/events/:id',
    passport.authenticate('bearer'),
    parseEventQueryParams,
    function (req, res, next) {
      var options = {
        populate: req.parameters.populate
      };

      if (access.userHasPermission(req.user, 'READ_EVENT_ALL')) {
        new api.Event().getById(req.params.id, options, function(err, event) {
          if (err) return next(err);

          res.json(event);
        });
      } else if (access.userHasPermission(req.user, 'READ_EVENT_USER')) {
        options.access = {
          userId: req.user._id
        };

        new api.Event().getById(req.params.id, options, function(err, event) {
          if (err) return next(err);

          res.json(event);
        });
      } else {
        // No valid READ EVENT permission
        res.sendStatus(403);
      }
    }
  );

  app.post(
    '/api/events',
    passport.authenticate('bearer'),
    access.authorize('CREATE_EVENT'),
    parseEventQueryParams,
    function(req, res, next) {
      var event = req.body;

      if (!req.is('multipart/form-data')) return next();

      if (event.teamIds) {
        event.teamIds = event.teamIds.split(",");
      }

      if (event.layerIds) {
        event.layerIds = event.layerIds.split(",");
      }

      new api.Event().importEvent(event, req.files.form, function(err, event) {
        res.status(201).json(event);
      });
    }
  );

  app.post(
    '/api/events',
    passport.authenticate('bearer'),
    access.authorize('CREATE_EVENT'),
    parseEventQueryParams,
    function(req, res, next) {
      new api.Event().createEvent(req.body, function(err, event) {
        if (err) return next(err);

        res.status(201).json(event);
      });
    }
  );

  app.put(
    '/api/events/:eventId',
    passport.authenticate('bearer'),
    access.authorize('UPDATE_EVENT'),
    parseEventQueryParams,
    function(req, res, next) {
      new api.Event(req.event).updateEvent(req.body, {populate: req.parameters.populate}, function(err, event) {
        if (err) return next(err);

        res.json(event);
      });
    }
  );

  app.delete(
    '/api/events/:eventId',
    passport.authenticate('bearer'),
    access.authorize('DELETE_EVENT'),
    function(req, res, next) {
      new api.Event(req.event).deleteEvent(function(err) {
        if (err) return next(err);

        res.status(204).send();
      });
    }
  );

  app.post(
    '/api/events/:eventId/teams',
    passport.authenticate('bearer'),
    access.authorize('UPDATE_EVENT'),
    function(req, res, next) {
      new api.Event(req.event).addTeam(req.body, function(err, event) {
        if (err) return next(err);

        res.json(event);
      });
    }
  );

  app.delete(
    '/api/events/:eventId/teams/:id',
    passport.authenticate('bearer'),
    access.authorize('UPDATE_EVENT'),
    function(req, res, next) {
      new api.Event(req.event).removeTeam({id: req.params.id}, function(err, event) {
        if (err) return next(err);

        res.json(event);
      });
    }
  );

  app.post(
    '/api/events/:eventId/layers',
    passport.authenticate('bearer'),
    access.authorize('UPDATE_EVENT'),
    function(req, res, next) {
      new api.Event(req.event).addLayer(req.body, function(err, event) {
        if (err) return next(err);

        res.json(event);
      });
    }
  );

  app.delete(
    '/api/events/:eventId/layers/:id',
    passport.authenticate('bearer'),
    access.authorize('UPDATE_EVENT'),
    function(req, res, next) {
      new api.Event(req.event).removeLayer({id: req.params.id}, function(err, event) {
        if (err) return next(err);

        res.json(event);
      });
    }
  );

  // export a zip of the form json and icons
  app.get(
    '/api/events/:eventId/form.zip',
    passport.authenticate('bearer'),
    validateEventAccess,
    function(req, res, next) {
      new api.Form(req.event).export(function(err, file) {
        if (err) return next(err);

        res.attachment(req.event.name + "-form.zip");
        file.pipe(res);
      });
    }
  );

  app.get(
    '/api/events/:eventId/form/icons.zip',
    passport.authenticate('bearer'),
    validateEventAccess,
    function(req, res) {
      var iconBasePath = new api.Icon(req.event._id).getBasePath();
      var archive = archiver('zip');
      res.attachment("icons.zip");
      archive.pipe(res);
      archive.bulk([{src: ['**'], dest: '/icons', expand: true, cwd: iconBasePath}]);
      archive.finalize();
    }
  );

  // get icon
  app.get(
    '/api/events/:eventId/form/icons/:type?/:variant?',
    passport.authenticate('bearer'),
    validateEventAccess,
    function(req, res, next) {
      new api.Icon(req.event._id, req.params.type, req.params.variant).getIcon(function(err, iconPath) {
        if (err || !iconPath) return next();

        res.sendFile(iconPath);
      });
    }
  );

  app.get(
    '/api/events/:eventId/form/icons*',
    passport.authenticate('bearer'),
    validateEventAccess,
    function(req, res, next) {
      new api.Icon().getDefaultIcon(function(err, iconPath) {
        if (err) return next(err);

        if (!iconPath) return res.status(404).send();

        res.sendFile(iconPath);
      });
    }
  );

  // Create a new icon
  app.post(
    '/api/events/:eventId/form/icons/:type?/:variant?',
    passport.authenticate('bearer'),
    access.authorize('CREATE_EVENT'),
    function(req, res, next) {
      new api.Icon(req.event._id, req.params.type, req.params.variant).create(req.files.icon, function(err, icon) {
        if (err) return next(err);

        return res.json(icon);
      });
    }
  );

  // Delete an icon
  app.delete(
    '/api/events/:eventId/form/icons/:type?/:variant?',
    passport.authenticate('bearer'),
    access.authorize('DELETE_EVENT'),
    function(req, res, next) {
      new api.Icon(req.event._id, req.params.type, req.params.variant).delete(function(err) {
        if (err) return next(err);

        return res.status(204).send();
      });
    }
  );
};
