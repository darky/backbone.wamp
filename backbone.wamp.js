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

      return WAMP_Model;

    })(Backbone.Model);
    WAMP_Collection = (function(_super) {
      __extends(WAMP_Collection, _super);

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

      return WAMP_Collection;

    })(Backbone.Collection);
    return [WAMP_Model, WAMP_Collection];
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,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