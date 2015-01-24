(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (function(global, factory) {
    var Backbone, autobahn, _, _ref;
    if (typeof define === "function" && define.amd) {
      return define(["underscore", "backbone", "autobahn"], function(_, Backbone, autobahn) {
        var _ref;
        return _ref = factory(_, Backbone, autobahn), global.Backbone.WAMP_Model = _ref[0], global.Backbone.WAMP_Collection = _ref[1], _ref;
      });
    } else if (typeof module !== "undefined" && module.exports) {
      _ = require("underscore");
      Backbone = require("backbone");
      autobahn = require("autobahn");
      return module.exports = factory(_, Backbone, autobahn);
    } else {
      return _ref = factory(global._, global.Backbone, autobahn), global.Backbone.WAMP_Model = _ref[0], global.Backbone.WAMP_Collection = _ref[1], _ref;
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
      switch (true) {
        case ajax_options.wamp_model:
          return "TODO";
        case ajax_options.wamp_collection:
          return "TODO";
        default:
          return backbone_ajax_original(ajax_options);
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
          wamp_model: true
        }));
      };

      return WAMP_Model;

    })(Backbone.Model);
    WAMP_Collection = (function(_super) {
      __extends(WAMP_Collection, _super);

      function WAMP_Collection() {
        return WAMP_Collection.__super__.constructor.apply(this, arguments);
      }

      WAMP_Collection.prototype.model = WAMP_Model;

      WAMP_Collection.prototype.sync = function(method, collection, options) {
        if (options == null) {
          options = {};
        }
        return WAMP_Collection.__super__.sync.call(this, method, collection, _.extend(options, {
          wamp_collection: true
        }));
      };

      return WAMP_Collection;

    })(Backbone.Collection);
    return [WAMP_Model, WAMP_Collection];
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhY2tib25lLndhbXAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTttU0FBQTs7QUFBQSxFQUFHLENBQUEsU0FDQyxNQURELEVBRUMsT0FGRCxHQUFBO0FBOENDLFFBQUEsMkJBQUE7QUFBQSxJQUFBLElBQUcsTUFBQSxDQUFBLE1BQUEsS0FBaUIsVUFBakIsSUFBa0MsTUFBTSxDQUFDLEdBQTVDO2FBQ0ksTUFBQSxDQUFPLENBQUMsWUFBRCxFQUFlLFVBQWYsRUFBMkIsVUFBM0IsQ0FBUCxFQUErQyxTQUFDLENBQUQsRUFBSSxRQUFKLEVBQWMsUUFBZCxHQUFBO0FBQzNDLFlBQUEsSUFBQTtlQUFBLE9BSUksT0FBQSxDQUFRLENBQVIsRUFBVyxRQUFYLEVBQXFCLFFBQXJCLENBSkosRUFDSSxNQUFNLENBQUMsUUFBUSxDQUFDLG9CQURwQixFQUVJLE1BQU0sQ0FBQyxRQUFRLENBQUMseUJBRnBCLEVBQUEsS0FEMkM7TUFBQSxDQUEvQyxFQURKO0tBQUEsTUFRSyxJQUFHLE1BQUEsQ0FBQSxNQUFBLEtBQW1CLFdBQW5CLElBQXFDLE1BQU0sQ0FBQyxPQUEvQztBQUNELE1BQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxZQUFSLENBQUosQ0FBQTtBQUFBLE1BQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSLENBRFgsQ0FBQTtBQUFBLE1BRUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSLENBRlgsQ0FBQTthQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLE9BQUEsQ0FBUSxDQUFSLEVBQVcsUUFBWCxFQUFxQixRQUFyQixFQUpoQjtLQUFBLE1BQUE7YUFPRCxPQUlJLE9BQUEsQ0FBUSxNQUFNLENBQUMsQ0FBZixFQUFrQixNQUFNLENBQUMsUUFBekIsRUFBbUMsUUFBbkMsQ0FKSixFQUNJLE1BQU0sQ0FBQyxRQUFRLENBQUMsb0JBRHBCLEVBRUksTUFBTSxDQUFDLFFBQVEsQ0FBQyx5QkFGcEIsRUFBQSxLQVBDO0tBdEROO0VBQUEsQ0FBQSxDQUFILENBQ2EsSUFEYixFQUVjLFNBQUMsQ0FBRCxFQUFJLFFBQUosRUFBYyxRQUFkLEdBQUE7QUFFTixRQUFBLCtEQUFBO0FBQUEsSUFBQSxVQUFBLEdBQ0k7QUFBQSxNQUFBLE1BQUEsRUFBVyxRQUFYO0FBQUEsTUFDQSxLQUFBLEVBQVcsUUFEWDtBQUFBLE1BRUEsT0FBQSxFQUFXLE9BRlg7QUFBQSxNQUdBLFFBQUEsRUFBVyxRQUhYO0FBQUEsTUFJQSxLQUFBLEVBQVcsTUFKWDtLQURKLENBQUE7QUFBQSxJQU9BLHNCQUFBLEdBQXlCLFFBQVEsQ0FBQyxJQVBsQyxDQUFBO0FBQUEsSUFTQSxRQUFRLENBQUMsSUFBVCxHQUFnQixTQUFDLFlBQUQsR0FBQTtBQUNaLGNBQU8sSUFBUDtBQUFBLGFBQ1MsWUFBWSxDQUFDLFVBRHRCO2lCQUVRLE9BRlI7QUFBQSxhQUdTLFlBQVksQ0FBQyxlQUh0QjtpQkFJUSxPQUpSO0FBQUE7aUJBTVEsc0JBQUEsQ0FBdUIsWUFBdkIsRUFOUjtBQUFBLE9BRFk7SUFBQSxDQVRoQixDQUFBO0FBQUEsSUFvQk07QUFFRixtQ0FBQSxDQUFBOzs7O09BQUE7O0FBQUEsMkJBQUEsSUFBQSxHQUFPLFNBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsT0FBaEIsR0FBQTs7VUFBZ0IsVUFBVTtTQUM3QjtlQUFBLHFDQUFNLE1BQU4sRUFBYyxLQUFkLEVBQ0ksQ0FBQyxDQUFDLE1BQUYsQ0FBUyxPQUFULEVBQWtCO0FBQUEsVUFBQSxVQUFBLEVBQWEsSUFBYjtTQUFsQixDQURKLEVBREc7TUFBQSxDQUFQLENBQUE7O3dCQUFBOztPQUZxQixRQUFRLENBQUMsTUFwQmxDLENBQUE7QUFBQSxJQTRCTTtBQUVGLHdDQUFBLENBQUE7Ozs7T0FBQTs7QUFBQSxnQ0FBQSxLQUFBLEdBQVEsVUFBUixDQUFBOztBQUFBLGdDQUVBLElBQUEsR0FBUSxTQUFDLE1BQUQsRUFBUyxVQUFULEVBQXFCLE9BQXJCLEdBQUE7O1VBQXFCLFVBQVU7U0FDbkM7ZUFBQSwwQ0FBTSxNQUFOLEVBQWMsVUFBZCxFQUNJLENBQUMsQ0FBQyxNQUFGLENBQVMsT0FBVCxFQUFrQjtBQUFBLFVBQUEsZUFBQSxFQUFrQixJQUFsQjtTQUFsQixDQURKLEVBREk7TUFBQSxDQUZSLENBQUE7OzZCQUFBOztPQUYwQixRQUFRLENBQUMsV0E1QnZDLENBQUE7V0FzQ0EsQ0FBQyxVQUFELEVBQWEsZUFBYixFQXhDTTtFQUFBLENBRmQsQ0FBQSxDQUFBO0FBQUEiLCJmaWxlIjoiYmFja2JvbmUud2FtcC5qcyIsInNvdXJjZVJvb3QiOiIuLyJ9