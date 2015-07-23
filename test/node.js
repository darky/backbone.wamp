var autobahn = require("autobahn"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  WAMPModel = require("../backbone.wamp.js").Model,
  WAMPCollection = require("../backbone.wamp.js").Collection;

global.WAMP_CONNECTION = new autobahn.Connection({
  realm: "realm1",
  url: "ws://127.0.0.1:9000/ws"
});
global.WAMP_MY_ID = "nodejs";
global.WAMP_CONNECTION.onopen = function () {
  var Model, Collection, CollectionURI, CollectionAuth,
    m, c, cUri, cAuth;

  Model = WAMPModel.extend({
    urlRoot: "testModel",
    wampRead: function (options) {
      return this.toJSON();
    },
    wampCreate: function (options) {
      var data = options.data,
        extra = options.extra;
      if (extra.checkError) {
        return new autobahn.Error("sync error");
      }
      this.set(_.extend(data, {
        id: parseInt(_.uniqueId())
      }));
      return this.toJSON()
    },
    wampUpdate: function (options) {
      var data = options.data,
        extra = options.extra;
      this.set(_.extend(data, {type: "update"}));
      return this.toJSON();
    },
    wampPatch: function (options) {
      var data = options.data,
        extra = options.extra;
      this.set(_.extend(data, {type: "patch"}));
      return this.toJSON()
    },
    wampDelete: function (options) {
      var extra = options.extra;
      this.set({});
      return {};
    }
  });

  Collection = WAMPCollection.extend({
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
              id: parseInt(_.uniqueId()),
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
            id: parseInt(_.uniqueId()),
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

  CollectionURI = WAMPCollection.extend({
    url: "qweqwe",
    wampGetUri : function (uri, peerId, action) {
      return "customUri." + action;
    },
    wampRead: function () {
      return [{customUri: true}];
    }
  });

  CollectionAuth = WAMPCollection.extend({
    url: "authCollection",
    wampAuth: function (uri, wampMyId, action, kwargs, details) {
      var defer = global.WAMP_CONNECTION.defer();
      defer.resolve(kwargs.data ? kwargs.data.auth : null);
      return defer.promise;
    },
    wampRead: function () {
      return [{auth : true}];
    }
  });

  m = new Model();
  c = new Collection();
  cUri = new CollectionURI();
  cAuth = new CollectionAuth();
};
global.WAMP_CONNECTION.open();
