// Import core Node.js module for spawning child processes
const child = require('child_process');

// Import plugin-specific configuration
const config = require('./config.json');

// Import centralized logger instead of using Winston directly
// All logs across the application now go through this logger for consistent formatting and transports
const log = require('../../../mage-server/logger'); // <-- updated path relative to this file

// Main initialization function for the Epic plugin
exports.initialize = function(app, callback) {
  // If the plugin is disabled in config, exit immediately
  if (!config.enable) {
    return callback();
  }

  // Log activation of the plugin
  log.info('activating epic plugin');

  // Start the worker processes
  startObservations();
  startAttachments();

  // Since nothing asynchronous is blocking setup, call callback in next tick
  setImmediate(function() {
    callback();
  });
};

// Function to start the Observations worker
function startObservations() {
  const observations = config.esri.observations;

  // Only start if observations are enabled
  if (observations.enable) {
    // Fork a child process to handle observations
    const observationsWorker = child.fork(__dirname + '/observations');

    // Listen for errors in the worker process
    observationsWorker.on('error', function(err) {
      log.error('***************** epic observation error ******************************', err);
      observationsWorker.kill();     // kill the worker if error occurs
      startObservations();           // restart the worker
    });

    // Listen for exit events from the worker
    observationsWorker.on('exit', function(exitCode) {
      log.warn('***************** epic observation exit, code ************************', exitCode);
      if (exitCode !== 0) {
        observationsWorker.kill();   // kill if it exited unexpectedly
        startObservations();         // restart the worker
      }
    });

    // Handle uncaught exceptions inside the worker
    observationsWorker.on('uncaughtException', function(err) {
      log.error('***************** Observation worker uncaught exception: ***************** ' + err);
    });

    // Clean up the worker when parent process exits
    process.on('exit', function(err) {
      log.warn('***************** epic parent process exit, killing ********************', err);
      observationsWorker.kill();
    });
  }
}

// Function to start the Attachments worker
function startAttachments() {
  const attachments = config.esri.attachments;

  // Only start if attachments are enabled
  if (attachments.enable) {
    // Fork a child process to handle attachments
    const attachmentsWorker = child.fork(__dirname + '/attachments');

    // Listen for errors in the worker process
    attachmentsWorker.on('error', function(err) {
      log.error('epic attachment error', err);
      attachmentsWorker.kill(); // kill the worker on error
    });

    // Listen for exit events from the worker
    attachmentsWorker.on('exit', function(exitCode) {
      log.warn('epic attachment exit, code', exitCode);
      if (exitCode !== 0) {
        attachmentsWorker.kill(); // kill if exited unexpectedly
        startAttachments();       // restart worker
      }
    });

    // Handle uncaught exceptions inside the worker
    attachmentsWorker.on('uncaughtException', function(err) {
      log.error('***************** Attachment worker uncaught exception: ***************** ' + err);
    });

    // Clean up the worker when parent process exits
    process.on('exit', function() {
      attachmentsWorker.kill();
    });
  }
}