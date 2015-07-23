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
  var Model, Collection, Collection_URI, Collection_Auth,
    m, c, c_uri, c_auth;

  Model = WAMPModel.extend({
    urlRoot: "test_model",
    wampRead: function (options) {
      return this.toJSON();
    },
    wampCreate: function (options) {
      var data = options.data,
        extra = options.extra;
      if (extra.check_error) {
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
    url: "test_collection",
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
        case extra.check_success_promise:
          deferred = global.WAMP_CONNECTION.defer();
          _.defer(function () {
            self.add(_.extend(data, {
              id: parseInt(_.uniqueId()),
              wampExtra: extra.check_it,
              wampOptions: !!details.progress
            }));
            deferred.resolve(self.last().toJSON());
          });
          return deferred.promise;
        case extra.check_error:
          return new autobahn.Error("sync error");
        case extra.check_error_promise:
          deferred = global.WAMP_CONNECTION.defer();
          _.defer(function () {
            deferred.resolve(new autobahn.Error("promise error"));
          });
          return deferred.promise;
        default:
          self.add(_.extend(data, {
            id: parseInt(_.uniqueId()),
            wampExtra: extra.check_it,
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

  Collection_URI = WAMPCollection.extend({
    url: "qweqwe",
    wampGetUri : function (uri, peer_id, action) {
      return "custom_uri." + action;
    },
    wampRead: function () {
      return [{custom_uri: true}];
    }
  });

  Collection_Auth = WAMPCollection.extend({
    url: "auth_collection",
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
  c_uri = new Collection_URI();
  c_auth = new Collection_Auth();
};
global.WAMP_CONNECTION.open();
