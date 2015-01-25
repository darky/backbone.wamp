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
          return connection.session.register("" + (_.result(_this, "url") || _.result(_this, "urlRoot")) + "." + (_.result(_this, "wamp_my_id")) + "." + action, function(args, kwargs, details) {
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

//# sourceMappingURL=data:application/json;base64,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RFUsR0FDTixDQUFDLENBQUMsQ0FBQyxNQUFGLENBQVMsWUFBVCxFQUF1QixlQUF2QixDQUFELENBRE0sR0FFSyxHQUZMLEdBRVUsVUFBVyxDQUFBLFlBQVksQ0FBQyxJQUFiLENBSHpCLEVBTUksRUFOSixFQU9JO0FBQUEsUUFBQSxJQUFBLEVBQVEsWUFBWSxDQUFDLElBQXJCO0FBQUEsUUFDQSxLQUFBLEVBQVEsQ0FBQyxDQUFDLE1BQUYsQ0FDSixZQUFZLENBQUMsVUFBYixJQUEyQixFQUR2QixFQUVKO0FBQUEsVUFBQSxhQUFBLEVBQWdCLFlBQVksQ0FBQyxhQUE3QjtTQUZJLENBRFI7T0FQSixFQVlJLFlBQVksQ0FBQyxZQVpqQixDQWNBLENBQUMsSUFkRCxDQWNNLFlBQVksQ0FBQyxPQWRuQixFQWM0QixZQUFZLENBQUMsS0FkekMsRUFmWTtJQUFBLENBaENoQixDQUFBO0FBQUEsSUFpRU07QUFFRixtQ0FBQSxDQUFBOztBQUFjLE1BQUEsb0JBQUMsVUFBRCxFQUFhLE9BQWIsR0FBQTs7VUFBYSxVQUFVO1NBQ2pDO0FBQUEsUUFBQSw2Q0FBQSxTQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsSUFBQSxDQUFBLE9BQWMsQ0FBQyxVQUFmO0FBQ0ksVUFBQSxlQUFlLENBQUMsSUFBaEIsQ0FBcUIsSUFBckIsQ0FBQSxDQURKO1NBRlU7TUFBQSxDQUFkOztBQUFBLDJCQUtBLElBQUEsR0FBTyxTQUFDLE1BQUQsRUFBUyxLQUFULEVBQWdCLE9BQWhCLEdBQUE7O1VBQWdCLFVBQVU7U0FDN0I7ZUFBQSxxQ0FBTSxNQUFOLEVBQWMsS0FBZCxFQUNJLENBQUMsQ0FBQyxNQUFGLENBQVMsa0JBQUEsYUFBbUIsU0FBbkIsQ0FBVCxFQUNJO0FBQUEsVUFBQSxhQUFBLEVBQWdCLEtBQUssQ0FBQyxFQUF0QjtTQURKLENBREosRUFERztNQUFBLENBTFAsQ0FBQTs7d0JBQUE7O09BRnFCLFFBQVEsQ0FBQyxNQWpFbEMsQ0FBQTtBQUFBLElBK0VNO0FBRUYsd0NBQUEsQ0FBQTs7QUFBYyxNQUFBLHlCQUFBLEdBQUE7QUFDVixRQUFBLGVBQWUsQ0FBQyxJQUFoQixDQUFxQixJQUFyQixDQUFBLENBQUE7QUFBQSxRQUNBLGtEQUFBLFNBQUEsQ0FEQSxDQURVO01BQUEsQ0FBZDs7QUFBQSxnQ0FJQSxLQUFBLEdBQVEsVUFKUixDQUFBOztBQUFBLGdDQU1BLElBQUEsR0FBUSxTQUFDLE1BQUQsRUFBUyxVQUFULEVBQXFCLE9BQXJCLEdBQUE7O1VBQXFCLFVBQVU7U0FDbkM7ZUFBQSwwQ0FBTSxNQUFOLEVBQWMsVUFBZCxFQUEwQixrQkFBQSxhQUFtQixTQUFuQixDQUExQixFQURJO01BQUEsQ0FOUixDQUFBOzs2QkFBQTs7T0FGMEIsUUFBUSxDQUFDLFdBL0V2QyxDQUFBO1dBNkZBLENBQUMsVUFBRCxFQUFhLGVBQWIsRUEvRk07RUFBQSxDQUZkLENBQUEsQ0FBQTtBQUFBIiwiZmlsZSI6ImJhY2tib25lLndhbXAuanMiLCJzb3VyY2VSb290IjoiLi8ifQ==