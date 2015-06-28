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
      var connection, get_uri, uri, wamp_my_id;
      uri = _.result(this, uri_key);
      wamp_my_id = _.result(this, "wamp_my_id") || global.WAMP_MY_ID;
      if (!uri || !wamp_my_id) {
        return;
      }
      connection = this.wamp_connection || global.WAMP_CONNECTION;
      get_uri = this.wamp_get_uri || global.WAMP_GET_URI || wamp_get_uri;
      return _.each(actions, (function(_this) {
        return function(action) {
          return connection.session.register(1 ? get_uri.call(_this, uri, wamp_my_id, action) : void 0, function(args, kwargs, details) {
            var name;
            try {
              kwargs.data = JSON.parse(kwargs.data);
            } catch (_error) {}
            return (typeof _this[name = "wamp_" + action] === "function" ? _this[name](kwargs, details) : void 0) || new autobahn.Error(1 ? "Not defined procedure for action: " + action : void 0);
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