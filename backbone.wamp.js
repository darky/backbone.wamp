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
    attach_handlers = function() {
      var connection, get_uri;
      connection = this.wamp_connection || global.WAMP_CONNECTION;
      get_uri = _.has(this, "wamp_get_uri") || _.has(this.constructor.prototype, "wamp_get_uri") ? this.wamp_get_uri : global.WAMP_GET_URI || this.wamp_get_uri;
      return _.each(actions, (function(_this) {
        return function(action) {
          return connection.session.register(get_uri.call(_this, _.result(_this, "url") || _.result(_this, "urlRoot"), _.result(_this, "wamp_my_id") || global.WAMP_MY_ID, action), function(args, kwargs, details) {
            var name;
            try {
              kwargs.data = JSON.parse(kwargs.data);
            } catch (_error) {}
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