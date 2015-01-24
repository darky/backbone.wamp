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
    var WAMP_Collection, WAMP_Model, action_map, backbone_ajax_original, mixin_wamp_options;
    action_map = {
      "POST": "create",
      "PUT": "update",
      "PATCH": "patch",
      "DELETE": "delete",
      "GET": "read"
    };
    mixin_wamp_options = function(method, entity, options) {
      var _ref;
      return _.extend(options, {
        wamp: true,
        wamp_connection: entity.wamp_connection,
        wamp_other_id: ((_ref = entity.collection) != null ? _ref.wamp_other_id : void 0) || entity.wamp_other_id
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
          wamp_model_id: ajax_options.wamp_model_id
        })
      }, ajax_options.wamp_options).then(ajax_options.success, ajax_options.error);
    };
    WAMP_Model = (function(_super) {
      __extends(WAMP_Model, _super);

      function WAMP_Model() {
        return WAMP_Model.__super__.constructor.apply(this, arguments);
      }

      WAMP_Model.prototype.sync = function(method, model, options) {
        if (options == null) {
          options = {};
        }
        return WAMP_Model.__super__.sync.call(this, method, model, _.extend(mixin_wamp_options.apply(null, arguments), {
          wamp_model_id: model.id
        }));
      };

      return WAMP_Model;

    })(Backbone.Model);
    WAMP_Collection = (function(_super) {
      __extends(WAMP_Collection, _super);

      function WAMP_Collection() {
        var connection;
        connection = this.wamp_connection || global.WAMP_CONNECTION;
        _.each(_.values(action_map), (function(_this) {
          return function(action) {
            return connection.session.register("" + (_.result(_this, "url")) + "." + (_.result(_this, "wamp_my_id")) + "." + action, function() {
              return _this["wamp_" + action].apply(_this, _.rest(arguments));
            });
          };
        })(this));
        WAMP_Collection.__super__.constructor.apply(this, arguments);
      }

      WAMP_Collection.prototype.model = WAMP_Model;

      WAMP_Collection.prototype.sync = function(method, collection, options) {
        if (options == null) {
          options = {};
        }
        return WAMP_Collection.__super__.sync.call(this, method, collection, mixin_wamp_options.apply(null, arguments));
      };

      return WAMP_Collection;

    })(Backbone.Collection);
    return [WAMP_Model, WAMP_Collection];
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,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