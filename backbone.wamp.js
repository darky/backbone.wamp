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
  })(this, function(_, Backbone, autobahn) {
    var WAMP_Collection, WAMP_Model;
    WAMP_Model = (function(_super) {
      __extends(WAMP_Model, _super);

      function WAMP_Model() {
        return WAMP_Model.__super__.constructor.apply(this, arguments);
      }

      return WAMP_Model;

    })(Backbone.Model);
    WAMP_Collection = (function(_super) {
      __extends(WAMP_Collection, _super);

      function WAMP_Collection() {
        return WAMP_Collection.__super__.constructor.apply(this, arguments);
      }

      return WAMP_Collection;

    })(Backbone.Collection);
    return [WAMP_Model, WAMP_Collection];
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhY2tib25lLndhbXAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTttU0FBQTs7QUFBQSxFQUFHLENBQUEsU0FDQyxNQURELEVBRUMsT0FGRCxHQUFBO0FBWUMsUUFBQSwyQkFBQTtBQUFBLElBQUEsSUFBRyxNQUFBLENBQUEsTUFBQSxLQUFpQixVQUFqQixJQUFrQyxNQUFNLENBQUMsR0FBNUM7YUFDSSxNQUFBLENBQU8sQ0FBQyxZQUFELEVBQWUsVUFBZixFQUEyQixVQUEzQixDQUFQLEVBQStDLFNBQUMsQ0FBRCxFQUFJLFFBQUosRUFBYyxRQUFkLEdBQUE7QUFDM0MsWUFBQSxJQUFBO2VBQUEsT0FJSSxPQUFBLENBQVEsQ0FBUixFQUFXLFFBQVgsRUFBcUIsUUFBckIsQ0FKSixFQUNJLE1BQU0sQ0FBQyxRQUFRLENBQUMsb0JBRHBCLEVBRUksTUFBTSxDQUFDLFFBQVEsQ0FBQyx5QkFGcEIsRUFBQSxLQUQyQztNQUFBLENBQS9DLEVBREo7S0FBQSxNQVFLLElBQUcsTUFBQSxDQUFBLE1BQUEsS0FBbUIsV0FBbkIsSUFBcUMsTUFBTSxDQUFDLE9BQS9DO0FBQ0QsTUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLFlBQVIsQ0FBSixDQUFBO0FBQUEsTUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVIsQ0FEWCxDQUFBO0FBQUEsTUFFQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVIsQ0FGWCxDQUFBO2FBR0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsT0FBQSxDQUFRLENBQVIsRUFBVyxRQUFYLEVBQXFCLFFBQXJCLEVBSmhCO0tBQUEsTUFBQTthQU9ELE9BSUksT0FBQSxDQUFRLE1BQU0sQ0FBQyxDQUFmLEVBQWtCLE1BQU0sQ0FBQyxRQUF6QixFQUFtQyxRQUFuQyxDQUpKLEVBQ0ksTUFBTSxDQUFDLFFBQVEsQ0FBQyxvQkFEcEIsRUFFSSxNQUFNLENBQUMsUUFBUSxDQUFDLHlCQUZwQixFQUFBLEtBUEM7S0FwQk47RUFBQSxDQUFBLENBQUgsQ0FDYSxJQURiLEVBRWMsU0FBQyxDQUFELEVBQUksUUFBSixFQUFjLFFBQWQsR0FBQTtBQUVOLFFBQUEsMkJBQUE7QUFBQSxJQUFNO0FBQU4sbUNBQUEsQ0FBQTs7OztPQUFBOzt3QkFBQTs7T0FBeUIsUUFBUSxDQUFDLE1BQWxDLENBQUE7QUFBQSxJQUVNO0FBQU4sd0NBQUEsQ0FBQTs7OztPQUFBOzs2QkFBQTs7T0FBOEIsUUFBUSxDQUFDLFdBRnZDLENBQUE7V0FJQSxDQUFDLFVBQUQsRUFBYSxlQUFiLEVBTk07RUFBQSxDQUZkLENBQUEsQ0FBQTtBQUFBIiwiZmlsZSI6ImJhY2tib25lLndhbXAuanMiLCJzb3VyY2VSb290IjoiLi8ifQ==