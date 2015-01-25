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
      var _ref;
      return _.extend(options, {
        wamp: true,
        wamp_connection: entity.wamp_connection,
        wamp_other_id: ((_ref = entity.collection) != null ? _ref.wamp_other_id : void 0) || entity.wamp_other_id || global.WAMP_OTHER_ID
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

      function WAMP_Model(attributes, options) {
        if (options == null) {
          options = {};
        }
        WAMP_Model.__super__.constructor.apply(this, arguments);
        if (!options.collection) {
          attach_handlers.call(this);
        }
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
        attach_handlers.call(this);
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

//# sourceMappingURL=data:application/json;base64,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QStFTTtBQUVGLHdDQUFBLENBQUE7O0FBQWMsTUFBQSx5QkFBQSxHQUFBO0FBQ1YsUUFBQSxlQUFlLENBQUMsSUFBaEIsQ0FBcUIsSUFBckIsQ0FBQSxDQUFBO0FBQUEsUUFDQSxrREFBQSxTQUFBLENBREEsQ0FEVTtNQUFBLENBQWQ7O0FBQUEsZ0NBSUEsS0FBQSxHQUFRLFVBSlIsQ0FBQTs7QUFBQSxnQ0FNQSxJQUFBLEdBQVEsU0FBQyxNQUFELEVBQVMsVUFBVCxFQUFxQixPQUFyQixHQUFBOztVQUFxQixVQUFVO1NBQ25DO2VBQUEsMENBQU0sTUFBTixFQUFjLFVBQWQsRUFBMEIsa0JBQUEsYUFBbUIsU0FBbkIsQ0FBMUIsRUFESTtNQUFBLENBTlIsQ0FBQTs7NkJBQUE7O09BRjBCLFFBQVEsQ0FBQyxXQS9FdkMsQ0FBQTtXQTZGQSxDQUFDLFVBQUQsRUFBYSxlQUFiLEVBL0ZNO0VBQUEsQ0FGZCxDQUFBLENBQUE7QUFBQSIsImZpbGUiOiJiYWNrYm9uZS53YW1wLmpzIiwic291cmNlUm9vdCI6Ii4vIn0=