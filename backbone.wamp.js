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
    var WAMP_Collection, WAMP_Model, action_map, backbone_ajax_original;
    action_map = {
      "POST": "create",
      "PUT": "update",
      "PATCH": "patch",
      "DELETE": "delete",
      "GET": "read"
    };
    backbone_ajax_original = Backbone.ajax;
    Backbone.ajax = function(ajax_options) {
      var connection;
      if (!ajax_options.wamp_model && !ajax_options.wamp_collection) {
        return backbone_ajax_original(ajax_options);
      }
      connection = ajax_options.wamp_connection || global.WAMP_CONNECTION;
      if (ajax_options.wamp_model) {
        return "TODO";
      } else if (ajax_options.wamp_collection) {
        return connection.session.call("" + ajax_options.url + "." + (_.result(ajax_options, "wamp_other_id")) + "." + action_map[ajax_options.type], [], ajax_options.data, ajax_options.wamp_options).then(ajax_options.success, ajax_options.error);
      }
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
        return WAMP_Model.__super__.sync.call(this, method, model, _.extend(options, {
          wamp_connection: model.wamp_connection,
          wamp_model: true,
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
        return WAMP_Collection.__super__.sync.call(this, method, collection, _.extend(options, {
          wamp_collection: true,
          wamp_connection: collection.wamp_connection,
          wamp_other_id: collection.wamp_other_id
        }));
      };

      return WAMP_Collection;

    })(Backbone.Collection);
    return [WAMP_Model, WAMP_Collection];
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,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