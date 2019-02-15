'use strict';

const path = require('path');
const express = require('express');
const http = require('http');
const Tokens = require('csrf');
const request = require('request-promise-native');

class Server {
  constructor(db) {
    const self = this;
    self.port = process.env.PORT;
    self.db = db;
    const app = express();
    const server = http.Server(app);
    self.app = app;
    self.server = server;
    self.csrf = new Tokens();

    logger.info('Attempting to start server at ' + self.port);
    const prod = process.env.PROD || false;

    // Serve static files from the React app
    app.use(express.static(path.join(rootPath, 'client/build')));

    // Middleware
    app.use(require('cookie-parser')());
    const bodyParser = require('body-parser');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    const secret = process.env.SECRET;
    const cookieSid = 'tv.sid';
    // Session store setup
    const session = require('express-session');
    const NedbStore = require('nedb-session-store')(session);
    const sessionStore = new NedbStore({
      filename: db.newDBPath('sessions')
    });
    app.use(session({
      resave: true,
      saveUninitialized: true,
      name: cookieSid,
      secret: secret,
      store: sessionStore
    }));

    // CSRF middleware
    app.use(function (req, res, next) {
      // Secret stored in req.session.csrfSecret
      var secret = req.session.csrfSecret;
      // If secret not already generated, generate new one and set it
      if (!secret) secret = self.csrf.secretSync();
      req.session.csrfSecret = secret;
      // Create a token and send to view engine data at csrf_token
      res.locals.csrf_token = self.csrf.create(secret);
      // Add a verify function, returns true if verified
      req.verifyCSRF = function (token) {
        if (!token) return false;
        return self.csrf.verify(secret, token);
      }
      next();
    });

    // Used for react to retrieve the csrf token
    app.get('/gettoken', (req, res) => {
      if (res.locals.csrf_token) {
        res.status(200).json({
          token: res.locals.csrf_token
        });
      } else {
        // Should only happen if this client doesn't have a session
        res.status(401).send('Who are you?');
      }
    });

    app.get('/time', (req, res) => {
      const csrfToken = req.query.csrfToken || req.body.csrfToken;
      // Verify csrf token first
      if (!req.verifyCSRF(csrfToken)) {
        return res.status(401).json({
          success: false,
          error: 'Error authenticating request, please try and refresh!'
        });
      }
      const { id, secs } = req.query;
      getTwitch('kraken/videos/' + id).then((data) => {
        if (data.error) {
          return res.status(404).json({
            success: false,
            error: 'Could not find video with id ' + id
          });
        }
        let date = new Date(data.recorded_at || data.created_at);
        let final_date = new Date(date.getTime() + secs * 1000);
        let out = {
          id: data.id,
          channel: data.channel.name,
          title: data.title,
          start_time: data.recorded_at || data.created_at,
          seconds_in: secs,
          final_time: final_date.toISOString().replace(/.\d+Z$/gi, 'Z')
        };
        if (data.broadcast_type !== 'archive') {
          out.note = 'Video is not an archived broadcast';
        }
        return res.json({
          success: true,
          result: out
        });
      }).catch((err) => {
        logger.error(err);
        return res.status(500).json({
          success: false,
          error: 'Error getting data from Twitch'
        });
      });
    });

    app.get('/vod', (req, res) => {
      const csrfToken = req.query.csrfToken || req.body.csrfToken;
      // Verify csrf token first
      if (!req.verifyCSRF(csrfToken)) {
        return res.status(401).json({
          success: false,
          error: 'Error authenticating request, please try and refresh!'
        });
      }
      const { channel, date } = req.query;
      getTwitch('kraken/users?login=' + channel).then((data) => {
        if (data.users && data.users.length > 0) {
          return searchVods(data.users[0], new Date(date));
        } else {
          return res.status(404).json({
            success: false,
            error: 'Could not find channel ' + channel
          });
        }
      }).then((data) => {
        return res.json({
          success: true,
          result: data
        });
      }).catch((err) => {
        logger.error(err);
        return res.status(500).json({
          success: false,
          error: 'Error searching for vod'
        });
      });
    });

    // Returns a promise
    function searchVods(user, date) {
      let dateTime = date.getTime();
      let offset = 0;
      return new Promise((resolve, reject) => {
        handlePromise(getTwitch(`kraken/channels/${user._id}/videos?limit=100&offset=${offset}&broadcast_type=archive`));

        function handlePromise(promise) {
          promise.then((data) => {
            if (data.videos) {
              if (data.videos.length == 0) { // Means there's no more videos to search
                resolve({
                  channel: user.name,
                  time: date.toISOString().replace(/.\d+Z$/gi, 'Z'),
                  vod: null
                });
                return;
              }
              for (let i = 0; i < data.videos.length; i++) {
                const video = data.videos[i];
                const startTime = new Date(video.recorded_at || video.created_at).getTime();
                const endTime = startTime + video.length * 1000;
                // console.log(`Looking at video ${startTime} < ${dateTime} < ${endTime}`);
                if (startTime <= dateTime && dateTime <= endTime) { // A match
                  const seconds_in = (dateTime - startTime) / 1000;
                  resolve({
                    channel: user.name,
                    time: date.toISOString().replace(/.\d+Z$/gi, 'Z'),
                    vod: {
                      id: video.id,
                      title: video.title,
                      start_time: video.recorded_at || video.created_at,
                      seconds_in: seconds_in,
                      url: video.url
                    }
                  });
                  return;
                }
              }
              offset += 100;
              handlePromise(getTwitch(`kraken/channels/${user._id}/videos?limit=100&offset=${offset}&broadcast_type=archive`));
            } else {
              reject(data.error || 'Unknown error from Twitch');
            }
          }).catch((err) => {
            reject(err);
          });
        }
      });
    }

    // Returns a promise, example: getTwitch('helix/streams')
    function getTwitch(apiCall) {
      logger.info(apiCall);
      // console.log(apiCall);
      const options = {
        method: 'GET',
        uri: 'https://api.twitch.tv/' + apiCall,
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          'Accept': 'application/vnd.twitchtv.v5+json',
          'Content-Type': 'application/json'
        },
        json: true,
        simple: false
      };
      return request(options);
    }

    // Serves the react index file
    app.get('*', (req, res) => {
      res.sendFile(path.join(rootPath, 'client/build/index.html'));
    });

    // Handle server errors
    app.use(function (err, req, res, next) {
      logger.error('Express error:', err);
      res.status(500).send('Something broke!');
    });

    // Start web server
    server.listen(self.port, function () {
      logger.info('Started server at port ' + self.port);
    });
  }
}

module.exports = Server;
