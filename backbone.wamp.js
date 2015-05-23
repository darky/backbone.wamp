(function() {
  var Backbone, _, autobahn, factory, global, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  global = (function() {
    return this;
  })();

  factory = function(global, _, Backbone, autobahn) {
    var WAMP_Collection, WAMP_Model, action_map, attach_handlers, backbone_ajax_original, mixin_wamp_options, wamp_get_uri;
    action_map = {
      "POST": "create",
      "PUT": "update",
      "PATCH": "patch",
      "DELETE": "delete",
      "GET": "read"
    };
    attach_handlers = function() {
      var connection, get_uri;
      connection = this.wamp_connection || global.WAMP_CONNECTION;
      get_uri = _.has(this, "wamp_get_uri") || _.has(this.constructor.prototype, "wamp_get_uri") ? this.wamp_get_uri : global.WAMP_GET_URI || this.wamp_get_uri;
      return _.each(_.values(action_map), (function(_this) {
        return function(action) {
          return connection.session.register(get_uri.call(_this, _.result(_this, "url") || _.result(_this, "urlRoot"), _.result(_this, "wamp_my_id") || global.WAMP_MY_ID, action), function(args, kwargs, details) {
            var name;
            if (kwargs.data) {
              kwargs.data = JSON.parse(kwargs.data);
            }
            return (typeof _this[name = "wamp_" + action] === "function" ? _this[name](kwargs, details) : void 0) || new autobahn.Error("Not defined procedure for action: " + action);
          });
        };
      })(this));
    };
    mixin_wamp_options = function(method, entity, options) {
      var ref, ref1;
      return _.extend(options, {
        wamp: true,
        wamp_connection: entity.wamp_connection,
        wamp_get_uri: _.has(entity, "wamp_get_uri") || _.has(entity.constructor.prototype, "wamp_get_uri") ? _.bind(entity.wamp_get_uri, entity) : global.WAMP_GET_URI || _.bind(entity.wamp_get_uri, entity),
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
      uri = ajax_options.wamp_model_id ? ajax_options.url.replace(new RegExp("/" + ajax_options.wamp_model_id + "$"), "") : ajax_options.url;
      defer = connection.defer();
      connection.session.call(ajax_options.wamp_get_uri(uri, _.result(ajax_options, "wamp_other_id"), action_map[ajax_options.type]), [], {
        data: ajax_options.data,
        extra: _.extend(ajax_options.wamp_extra || {}, {
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
          this.wamp_attach_handlers();
        }
      }

      WAMP_Model.prototype.sync = function(method, model, options) {
        if (options == null) {
          options = {};
        }
        return WAMP_Model.__super__.sync.call(this, method, model, _.extend(mixin_wamp_options(method, model, options), {
          wamp_model_id: model.id
        }));
      };

      WAMP_Model.prototype.wamp_attach_handlers = function() {
        if (this.collection) {
          return console.warn("wamp_create, wamp_read, wamp_update, wamp_delete, wamp_patch handlers were not registered for `" + this.constructor.name + "`, because it contained in `" + this.collection.constructor.name + "`");
        }
        if (_.result(this, "urlRoot") && (this.wamp_my_id || global.WAMP_MY_ID)) {
          return attach_handlers.call(this);
        } else {
          return console.warn("wamp_create, wamp_read, wamp_update, wamp_delete, wamp_patch handlers were not registered for `" + this.constructor.name + "`. Check `urlRoot` / global `WAMP_MY_ID` or `wamp_my_id` property/method");
        }
      };

      WAMP_Model.prototype.wamp_get_uri = wamp_get_uri;

      return WAMP_Model;

    })(Backbone.Model);
    WAMP_Collection = (function(superClass) {
      extend(WAMP_Collection, superClass);

      function WAMP_Collection() {
        WAMP_Collection.__super__.constructor.apply(this, arguments);
        this.wamp_attach_handlers();
      }

      WAMP_Collection.prototype.model = WAMP_Model;

      WAMP_Collection.prototype.sync = function(method, collection, options) {
        if (options == null) {
          options = {};
        }
        return WAMP_Collection.__super__.sync.call(this, method, collection, mixin_wamp_options(method, collection, options));
      };

      WAMP_Collection.prototype.wamp_attach_handlers = function() {
        if (_.result(this, "url") && (this.wamp_my_id || global.WAMP_MY_ID)) {
          return attach_handlers.call(this);
        } else {
          return console.warn("wamp_create, wamp_read, wamp_update, wamp_delete, wamp_patch handlers were not registered for `" + this.constructor.name + "`. Check `url` / global `WAMP_MY_ID` or `wamp_my_id` property/method");
        }
      };

      WAMP_Collection.prototype.wamp_get_uri = wamp_get_uri;

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