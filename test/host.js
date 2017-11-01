'use strict';

var express = require('express');
var request = require('supertest');
var proxy = require('../');
var Chance = require('chance');
var chance = new Chance();
var nock = require('nock');

describe('host can be a dynamic function', function() {

  this.timeout(10000);

  describe('and memoization can be disabled', function() {
      var firstPort = Math.floor(Math.random() * 65536);
      var secondPort = Math.floor(Math.random() * 65536);
      var domain = chance.domain();
      nock('http://' + domain + ':' + firstPort)
        .get('/')
        .reply(204);
      nock('http://' + domain + ':' + secondPort)
        .get('/')
        .reply(200);

      var hostFn = function(req) {
        return 'http://' + domain + ':' + req.params.port;
      };

      var app = express();

      app.use('/proxy/:port', proxy(hostFn, { memoizeHost: false }));

      it('when not memoized, host resolves to a second value on the seecond call', function(done) {
        request(app)
          .get('/proxy/' + firstPort)
          .expect(204)
          .end(function(err) {
            if (err) {
              return done(err);
            }
            request(app)
                .get('/proxy/' + secondPort)
                .expect(200, done);
          });
      });
  });
});

describe('host is a promise', function() {

  this.timeout(10000);

  var app = express();

  var port = Math.floor(Math.random() * 65536);
  var domain = chance.domain();
  nock('http://' + domain + ':' + port)
    .get('/')
    .reply(201);

  var hostFn = function(req) {
    return 'http://' + domain + ':' + req.params.port;
  };

  app.use('/proxy-promise/:port', proxy(hostFn, { memoizeHost: false }));

  it('host returns a promise that should be resolved and its value is the host URL.', function(done) {
    request(app)
      .get('/proxy-promise/' + port)
      .expect(201)
      .end(done);
  });
});
