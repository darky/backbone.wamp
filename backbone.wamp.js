(function() {
  var Backbone, _, autobahn, factory, global, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  global = (function() {
    return this;
  })();

  factory = function(global, _, Backbone, autobahn) {
    var WAMP_Collection, WAMP_Model, action_map, actions, attach_handlers, backbone_ajax_original, mixin_wamp_options, wamp_get_uri;
    action_map = {
      "POST": "create",
      "PUT": "update",
      "PATCH": "patch",
      "DELETE": "delete",
      "GET": "read"
    };
    actions = _.values(action_map);
    attach_handlers = function(uri_key) {
      var connection, get_uri, uri, wamp_auth, wamp_my_id;
      uri = _.result(this, uri_key);
      wamp_my_id = _.result(this, "wamp_my_id") || global.WAMP_MY_ID;
      if (!uri || !wamp_my_id) {
        return;
      }
      connection = this.wamp_connection || global.WAMP_CONNECTION;
      get_uri = this.wamp_get_uri || global.WAMP_GET_URI || wamp_get_uri;
      wamp_auth = this.wamp_auth || global.WAMP_AUTH || function() {
        var defer;
        defer = connection.defer();
        defer.resolve(true);
        if (_.isFunction(defer.promise)) {
          return defer;
        } else if (_.isObject(defer.promise)) {
          return defer.promise;
        }
      };
      return _.each(actions, (function(_this) {
        return function(action) {
          return connection.session.register(1 ? get_uri.call(_this, uri, wamp_my_id, action) : void 0, function(args, kwargs, details) {
            var defer;
            defer = connection.defer();
            wamp_auth(uri, wamp_my_id, action, kwargs, details).then(function(is_auth) {
              var action_result, name;
              if (is_auth === true) {
                try {
                  kwargs.data = JSON.parse(kwargs.data);
                } catch (_error) {}
                action_result = typeof _this[name = "wamp_" + action] === "function" ? _this[name](kwargs, details) : void 0;
                if (typeof (action_result != null ? action_result.then : void 0) === "function") {
                  return action_result.then(function(result) {
                    return defer.resolve(result);
                  });
                } else if (action_result != null) {
                  return defer.resolve(action_result);
                } else {
                  return defer.resolve(new autobahn.Error("Not defined procedure for action: " + action));
                }
              } else {
                return defer.resolve(new autobahn.Error("Auth error"));
              }
            });
            if (_.isFunction(defer.promise)) {
              return defer;
            } else if (_.isObject(defer.promise)) {
              return defer.promise;
            }
          });
        };
      })(this));
    };
    mixin_wamp_options = function(method, entity, options) {
      var ref, ref1;
      return _.extend(options, {
        wamp: true,
        wamp_connection: entity.wamp_connection,
        wamp_get_uri: _.bind(1 ? entity.wamp_get_uri || global.WAMP_GET_URI || wamp_get_uri : void 0, entity),
        wamp_my_id: ((ref = entity.collection) != null ? ref.wamp_my_id : void 0) || entity.wamp_my_id || global.WAMP_MY_ID,
        wamp_other_id: ((ref1 = entity.collection) != null ? ref1.wamp_other_id : void 0) || entity.wamp_other_id || global.WAMP_OTHER_ID
      });
    };
    wamp_get_uri = function(uri, peer_id, action) {
      return uri + "." + peer_id + "." + action;
    };
    backbone_ajax_original = Backbone.ajax;
    Backbone.ajax = function(ajax_options) {
      var connection, defer, uri;
      if (!ajax_options.wamp) {
        return backbone_ajax_original(ajax_options);
      }
      connection = ajax_options.wamp_connection || global.WAMP_CONNECTION;
      uri = ajax_options.wamp_model_id ? ajax_options.url.replace(1 ? new RegExp("/" + ajax_options.wamp_model_id + "$") : void 0, "") : ajax_options.url;
      defer = connection.defer();
      connection.session.call(1 ? ajax_options.wamp_get_uri(uri, _.result(ajax_options, "wamp_other_id"), action_map[ajax_options.type]) : void 0, [], {
        data: ajax_options.data,
        extra: _.extend(1 ? ajax_options.wamp_extra || {} : void 0, {
          wamp_model_id: ajax_options.wamp_model_id,
          wamp_my_id: ajax_options.wamp_my_id
        })
      }, ajax_options.wamp_options).then(function(obj) {
        if (obj != null ? obj.error : void 0) {
          ajax_options.error(obj);
          return defer.reject(obj);
        } else {
          ajax_options.success(obj);
          return defer.resolve(obj);
        }
      }, function(obj) {
        ajax_options.error(obj);
        return defer.reject(obj);
      });
      if (_.isFunction(defer.promise)) {
        return defer;
      } else if (_.isObject(defer.promise)) {
        return defer.promise;
      }
    };
    WAMP_Model = (function(superClass) {
      extend(WAMP_Model, superClass);

      function WAMP_Model(attributes, options) {
        if (options == null) {
          options = {};
        }
        WAMP_Model.__super__.constructor.apply(this, arguments);
        if (!options.collection) {
          attach_handlers.call(this, "urlRoot");
        }
      }

      WAMP_Model.prototype.sync = function(method, model, options) {
        if (options == null) {
          options = {};
        }
        return WAMP_Model.__super__.sync.call(this, method, model, _.extend(1 ? mixin_wamp_options(method, model, options) : void 0, {
          wamp_model_id: model.id
        }));
      };

      return WAMP_Model;

    })(Backbone.Model);
    WAMP_Collection = (function(superClass) {
      extend(WAMP_Collection, superClass);

      function WAMP_Collection() {
        WAMP_Collection.__super__.constructor.apply(this, arguments);
        attach_handlers.call(this, "url");
      }

      WAMP_Collection.prototype.model = WAMP_Model;

      WAMP_Collection.prototype.sync = function(method, collection, options) {
        if (options == null) {
          options = {};
        }
        return WAMP_Collection.__super__.sync.call(this, method, collection, mixin_wamp_options(method, collection, options));
      };

      return WAMP_Collection;

    })(Backbone.Collection);
    return [WAMP_Model, WAMP_Collection];
  };

  if (typeof define === "function" && define.amd) {
    define(["underscore", "backbone", "autobahn"], function(_, Backbone, autobahn) {
      var ref;
      return ref = factory(global, _, Backbone, autobahn), global.Backbone.WAMP_Model = ref[0], global.Backbone.WAMP_Collection = ref[1], ref;
    });
  } else if (typeof module !== "undefined" && module.exports) {
    _ = require("underscore");
    Backbone = require("backbone");
    autobahn = require("autobahn");
    module.exports = factory(global, _, Backbone, autobahn);
  } else {
    ref = factory(global, global._, global.Backbone, autobahn), global.Backbone.WAMP_Model = ref[0], global.Backbone.WAMP_Collection = ref[1];
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,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