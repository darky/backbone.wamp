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
            if (kwargs.data) {
              kwargs.data = JSON.parse(kwargs.data);
            }
            return _this["wamp_" + action](kwargs, details);
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