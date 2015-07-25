/* eslint-env node */

"use strict";

var autobahn = require("autobahn"),
  _ = require("underscore"),
  WampModel = require("../backbone.wamp.js").Model,
  WampCollection = require("../backbone.wamp.js").Collection;

global.WAMP_CONNECTION = new autobahn.Connection({
  realm: "realm1",
  url: "ws://127.0.0.1:9000/ws"
});
global.WAMP_MY_ID = "nodejs";
global.WAMP_CONNECTION.onopen = function () {
  var Model, Collection, CollectionUri, CollectionAuth, obj = {};

  Model = WampModel.extend({
    urlRoot: "testModel",
    wampRead: function () {
      return this.toJSON();
    },
    wampCreate: function (options) {
      var data = options.data,
        extra = options.extra;
      if (extra.checkError) {
        return new autobahn.Error("sync error");
      }
      this.set(_.extend(data, {
        id: parseInt(_.uniqueId(), 10)
      }));
      return this.toJSON();
    },
    wampUpdate: function (options) {
      var data = options.data;
      this.set(_.extend(data, {type: "update"}));
      return this.toJSON();
    },
    wampPatch: function (options) {
      var data = options.data;
      this.set(_.extend(data, {type: "patch"}));
      return this.toJSON();
    },
    wampDelete: function () {
      this.set({});
      return {};
    }
  });

  Collection = WampCollection.extend({
    url: "testCollection",
    wampRead: function (options) {
      var extra = options.extra;
      if (extra.wampModelId) {
        return this.get(extra.wampModelId)
          .toJSON();
      } else {
        return this.toJSON();
      }
    },
    wampCreate: function (options, details) {
      var data = options.data,
        deferred,
        extra = options.extra,
        self = this;
      switch (true) {
        case extra.checkSuccessPromise:
          deferred = global.WAMP_CONNECTION.defer();
          _.defer(function () {
            self.add(_.extend(data, {
              id: parseInt(_.uniqueId(), 10),
              wampExtra: extra.checkIt,
              wampOptions: !!details.progress
            }));
            deferred.resolve(self.last().toJSON());
          });
          return deferred.promise;
        case extra.checkError:
          return new autobahn.Error("sync error");
        case extra.checkErrorPromise:
          deferred = global.WAMP_CONNECTION.defer();
          _.defer(function () {
            deferred.resolve(new autobahn.Error("promise error"));
          });
          return deferred.promise;
        default:
          self.add(_.extend(data, {
            id: parseInt(_.uniqueId(), 10),
            wampExtra: extra.checkIt,
            wampOptions: !!details.progress
          }));
          return this.last().toJSON();
      }
    },
    wampUpdate: function (options) {
      var data = options.data,
        extra = options.extra;
      return this.get(extra.wampModelId)
        .set(_.extend(data, {type: "update"}));
    },
    wampPatch: function (options) {
      var data = options.data,
        extra = options.extra;
      return this.get(extra.wampModelId)
        .set(_.extend(data, {type: "patch"}));
    },
    wampDelete: function (options) {
      var extra = options.extra;
      this.remove(this.get(extra.wampModelId));
      return {};
    }
  });

  CollectionUri = WampCollection.extend({
    url: "qweqwe",
    wampGetUri: function (uri, peerId, action) {
      return "customUri." + action;
    },
    wampRead: function () {
      return [{customUri: true}];
    }
  });

  CollectionAuth = WampCollection.extend({
    url: "authCollection",
    wampAuth: function (uriInfo, kwargs) {
      var defer = global.WAMP_CONNECTION.defer();
      defer.resolve(kwargs.data ? kwargs.data.auth : null);
      return defer.promise;
    },
    wampRead: function () {
      return [{auth: true}];
    }
  });

  _.each(
    [Model, Collection, CollectionUri, CollectionAuth],
    function (Klass) {
      obj[Klass] = new Klass();
    }
  );
};
global.WAMP_CONNECTION.open();
