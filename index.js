'use strict';

const path = require('path');
const winston = require('winston');

// Setup logger
global.logger = new winston.Logger({
  transports: [
    new winston.transports.File({
      name: 'main',
      filename: 'main.log',
      handleExceptions: true,
      humanReadableUnhandledException: true,
      level: 'info',
      json: false
    }),
    new winston.transports.File({
      name: 'mainjson',
      filename: 'mainjson.log',
      handleExceptions: true,
      humanReadableUnhandledException: true,
      level: 'info'
    })
  ],
  level: 'silly',
  exitOnError: false
});

if (process.env.NODE_ENV !== 'production' || process.env.LOG_TO_CONSOLE) { // Setup dev logger
  logger.add(winston.transports.Console, {
    handleExceptions: true,
    humanReadableUnhandledException: true,
    level: 'silly',
    timestamp: true
  });
}

global.rootPath = __dirname;

process.on('uncaughtException', function (err) {
  logger.error('Uncaught exception', err);
});

const clientID = process.env.TWITCH_CLIENT_ID

const DBClient = require('./db.js');
const db = new DBClient();

const Server = require('./server.js');
const server = new Server(db);
