(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (function(global, factory) {
    var Backbone, autobahn, _, _ref;
    if (typeof define === "function" && define.amd) {
      return define(["underscore", "backbone", "autobahn"], function(_, Backbone, autobahn) {
        var _ref;
        return _ref = factory(global, _, Backbone, autobahn), global.Backbone.WAMP_Model = _ref[0], global.Backbone.WAMP_Collection = _ref[1], _ref;
      });
    } else if (typeof module !== "undefined" && module.exports) {
      _ = require("underscore");
      Backbone = require("backbone");
      autobahn = require("autobahn");
      return module.exports = factory(global, _, Backbone, autobahn);
    } else {
      return _ref = factory(global, global._, global.Backbone, autobahn), global.Backbone.WAMP_Model = _ref[0], global.Backbone.WAMP_Collection = _ref[1], _ref;
    }
  })((function() {
    return this;
  })(), function(global, _, Backbone, autobahn) {
    var WAMP_Collection, WAMP_Model, action_map, attach_handlers, backbone_ajax_original, mixin_wamp_options;
    action_map = {
      "POST": "create",
      "PUT": "update",
      "PATCH": "patch",
      "DELETE": "delete",
      "GET": "read"
    };
    attach_handlers = function() {
      var connection;
      connection = this.wamp_connection || global.WAMP_CONNECTION;
      return _.each(_.values(action_map), (function(_this) {
        return function(action) {
          return connection.session.register("" + (_.result(_this, "url") || _.result(_this, "urlRoot")) + "." + (_.result(_this, "wamp_my_id") || global.WAMP_MY_ID) + "." + action, function(args, kwargs, details) {
            var _name;
            if (kwargs.data) {
              kwargs.data = JSON.parse(kwargs.data);
            }
            return (typeof _this[_name = "wamp_" + action] === "function" ? _this[_name](kwargs, details) : void 0) || new autobahn.Error("Not defined procedure for action: " + action);
          });
        };
      })(this));
    };
    mixin_wamp_options = function(method, entity, options) {
      var _ref, _ref1;
      return _.extend(options, {
        wamp: true,
        wamp_connection: entity.wamp_connection,
        wamp_my_id: ((_ref = entity.collection) != null ? _ref.wamp_my_id : void 0) || entity.wamp_my_id || global.WAMP_MY_ID,
        wamp_other_id: ((_ref1 = entity.collection) != null ? _ref1.wamp_other_id : void 0) || entity.wamp_other_id || global.WAMP_OTHER_ID
      });
    };
    backbone_ajax_original = Backbone.ajax;
    Backbone.ajax = function(ajax_options) {
      var connection, uri;
      if (!ajax_options.wamp) {
        return backbone_ajax_original(ajax_options);
      }
      connection = ajax_options.wamp_connection || global.WAMP_CONNECTION;
      uri = ajax_options.wamp_model_id ? ajax_options.url.replace(new RegExp("/" + ajax_options.wamp_model_id + "$"), "") : ajax_options.url;
      return connection.session.call("" + uri + "." + (_.result(ajax_options, "wamp_other_id")) + "." + action_map[ajax_options.type], [], {
        data: ajax_options.data,
        extra: _.extend(ajax_options.wamp_extra || {}, {
          wamp_model_id: ajax_options.wamp_model_id,
          wamp_my_id: ajax_options.wamp_my_id
        })
      }, ajax_options.wamp_options).then(function(obj) {
        if (obj != null ? obj.error : void 0) {
          return ajax_options.error(obj);
        } else {
          return ajax_options.success(obj);
        }
      }, function(obj) {
        return ajax_options.error(obj);
      });
    };
    WAMP_Model = (function(_super) {
      __extends(WAMP_Model, _super);

      function WAMP_Model(attributes, options) {
        if (options == null) {
          options = {};
        }
        WAMP_Model.__super__.constructor.apply(this, arguments);
        if (!options.collection && _.result(this, "urlRoot")) {
          attach_handlers.call(this);
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

      return WAMP_Model;

    })(Backbone.Model);
    WAMP_Collection = (function(_super) {
      __extends(WAMP_Collection, _super);

      function WAMP_Collection() {
        attach_handlers.call(this);
        WAMP_Collection.__super__.constructor.apply(this, arguments);
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
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,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