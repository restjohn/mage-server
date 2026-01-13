// logger.js
const { createLogger, format, transports } = require('winston');

const log = createLogger({
  level: 'info', // default log level
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }), // capture stack traces for errors
    format.splat(), // support printf-style formatting
    format.printf(({ timestamp, level, message, ...meta }) => {
      const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
      return `${timestamp} [${level.toUpperCase()}] ${message} ${metaString}`;
    })
  ),
  transports: [
    new transports.Console()
  ],
});

// Export same interface used in code
module.exports = {
  info: (msg, meta) => log.info(msg, meta),
  warn: (msg, meta) => log.warn(msg, meta),
  error: (msg, meta) => log.error(msg, meta),
  debug: (msg, meta) => log.debug(msg, meta),
};
