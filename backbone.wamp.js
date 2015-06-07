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
    attach_handlers = function() {
      var connection, get_uri;
      connection = this.wamp_connection || global.WAMP_CONNECTION;
      get_uri = _.has(this, "wamp_get_uri") || _.has(this.constructor.prototype, "wamp_get_uri") ? this.wamp_get_uri : global.WAMP_GET_URI || this.wamp_get_uri;
      return _.each(actions, (function(_this) {
        return function(action) {
          return connection.session.register(get_uri.call(_this, _.result(_this, "url") || _.result(_this, "urlRoot"), _.result(_this, "wamp_my_id") || global.WAMP_MY_ID, action), function(args, kwargs, details) {
            var name;
            try {
              kwargs.data = JSON.parse(kwargs.data);
            } catch (_error) {}
            return (typeof _this[name = "wamp_" + action] === "function" ? _this[name](kwargs, details) : void 0) || new autobahn.Error("Not defined procedure for action: " + action);
          });
        };
      })(this));
    };
    mixin_wamp_options = function(method, entity, options) {
      var ref, ref1;
      return _.extend(options, {
        wamp: true,
        wamp_connection: entity.wamp_connection,
        wamp_get_uri: _.has(entity, "wamp_get_uri") || _.has(entity.constructor.prototype, "wamp_get_uri") ? _.bind(entity.wamp_get_uri, entity) : global.WAMP_GET_URI || _.bind(entity.wamp_get_uri, entity),
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
      uri = ajax_options.wamp_model_id ? ajax_options.url.replace(new RegExp("/" + ajax_options.wamp_model_id + "$"), "") : ajax_options.url;
      defer = connection.defer();
      connection.session.call(ajax_options.wamp_get_uri(uri, _.result(ajax_options, "wamp_other_id"), action_map[ajax_options.type]), [], {
        data: ajax_options.data,
        extra: _.extend(ajax_options.wamp_extra || {}, {
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

      WAMP_Model.prototype.wamp_get_uri = wamp_get_uri;

      return WAMP_Model;

    })(Backbone.Model);
    WAMP_Collection = (function(superClass) {
      extend(WAMP_Collection, superClass);

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

      WAMP_Collection.prototype.wamp_get_uri = wamp_get_uri;

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhY2tib25lLndhbXAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwyQ0FBQTtJQUFBOzs7RUFBQSxNQUFBLEdBQVksQ0FBQSxTQUFBO1dBQUc7RUFBSCxDQUFBLENBQUgsQ0FBQTs7RUFDVCxPQUFBLEdBQVUsU0FBQyxNQUFELEVBQVMsQ0FBVCxFQUFZLFFBQVosRUFBc0IsUUFBdEI7QUFFTixRQUFBO0lBQUEsVUFBQSxHQUNJO01BQUEsTUFBQSxFQUFXLFFBQVg7TUFDQSxLQUFBLEVBQVcsUUFEWDtNQUVBLE9BQUEsRUFBVyxPQUZYO01BR0EsUUFBQSxFQUFXLFFBSFg7TUFJQSxLQUFBLEVBQVcsTUFKWDs7SUFNSixPQUFBLEdBQVUsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxVQUFUO0lBRVYsZUFBQSxHQUFrQixTQUFBO0FBQ2QsVUFBQTtNQUFBLFVBQUEsR0FBYSxJQUFDLENBQUEsZUFBRCxJQUFvQixNQUFNLENBQUM7TUFFeEMsT0FBQSxHQUVRLENBQUMsQ0FBQyxHQUFGLENBQU0sSUFBTixFQUFTLGNBQVQsQ0FBQSxJQUNBLENBQUMsQ0FBQyxHQUFGLENBQU0sSUFBQyxDQUFBLFdBQVcsQ0FBQSxTQUFsQixFQUFzQixjQUF0QixDQUZKLEdBSUksSUFBQyxDQUFBLFlBSkwsR0FNSSxNQUFNLENBQUMsWUFBUCxJQUF1QixJQUFDLENBQUE7YUFFaEMsQ0FBQyxDQUFDLElBQUYsQ0FBTyxPQUFQLEVBQWdCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxNQUFEO2lCQUNaLFVBQVUsQ0FBQyxPQUFPLENBQUMsUUFBbkIsQ0FDSSxPQUFPLENBQUMsSUFBUixDQUNJLEtBREosRUFFSSxDQUFDLENBQUMsTUFBRixDQUFTLEtBQVQsRUFBWSxLQUFaLENBQUEsSUFBc0IsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxLQUFULEVBQVksU0FBWixDQUYxQixFQUdJLENBQUMsQ0FBQyxNQUFGLENBQVMsS0FBVCxFQUFZLFlBQVosQ0FBQSxJQUE2QixNQUFNLENBQUMsVUFIeEMsRUFJSSxNQUpKLENBREosRUFPSSxTQUFDLElBQUQsRUFBTyxNQUFQLEVBQWUsT0FBZjtBQUNJLGdCQUFBO0FBQUE7Y0FBSSxNQUFNLENBQUMsSUFBUCxHQUFjLElBQUksQ0FBQyxLQUFMLENBQVcsTUFBTSxDQUFDLElBQWxCLEVBQWxCO2FBQUE7MkVBQ0EsWUFBcUIsUUFBUSxrQkFBN0IsSUFDSSxJQUFBLFFBQVEsQ0FBQyxLQUFULENBQ0Esb0NBQUEsR0FBcUMsTUFEckM7VUFIUixDQVBKO1FBRFk7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhCO0lBWmM7SUE0QmxCLGtCQUFBLEdBQXFCLFNBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsT0FBakI7QUFDakIsVUFBQTthQUFBLENBQUMsQ0FBQyxNQUFGLENBQVMsT0FBVCxFQUNJO1FBQUEsSUFBQSxFQUFrQixJQUFsQjtRQUNBLGVBQUEsRUFBa0IsTUFBTSxDQUFDLGVBRHpCO1FBRUEsWUFBQSxFQUVRLENBQUMsQ0FBQyxHQUFGLENBQU0sTUFBTixFQUFjLGNBQWQsQ0FBQSxJQUNBLENBQUMsQ0FBQyxHQUFGLENBQU0sTUFBTSxDQUFDLFdBQVcsQ0FBQSxTQUF4QixFQUE0QixjQUE1QixDQUZKLEdBSUksQ0FBQyxDQUFDLElBQUYsQ0FBTyxNQUFNLENBQUMsWUFBZCxFQUE0QixNQUE1QixDQUpKLEdBTUksTUFBTSxDQUFDLFlBQVAsSUFDQyxDQUFDLENBQUMsSUFBRixDQUFPLE1BQU0sQ0FBQyxZQUFkLEVBQTRCLE1BQTVCLENBVlQ7UUFXQSxVQUFBLDBDQUFtQyxDQUFFLG9CQUFuQixJQUNkLE1BQU0sQ0FBQyxVQURPLElBQ08sTUFBTSxDQUFDLFVBWmhDO1FBYUEsYUFBQSw0Q0FBbUMsQ0FBRSx1QkFBbkIsSUFDZCxNQUFNLENBQUMsYUFETyxJQUNVLE1BQU0sQ0FBQyxhQWRuQztPQURKO0lBRGlCO0lBa0JyQixZQUFBLEdBQWUsU0FBQyxHQUFELEVBQU0sT0FBTixFQUFlLE1BQWY7YUFFTCxHQUFELEdBQUssR0FBTCxHQUNDLE9BREQsR0FDUyxHQURULEdBRUM7SUFKSztJQU9mLHNCQUFBLEdBQXlCLFFBQVEsQ0FBQztJQUVsQyxRQUFRLENBQUMsSUFBVCxHQUFnQixTQUFDLFlBQUQ7QUFDWixVQUFBO01BQUEsSUFBQSxDQUFPLFlBQVksQ0FBQyxJQUFwQjtBQUNJLGVBQU8sc0JBQUEsQ0FBdUIsWUFBdkIsRUFEWDs7TUFHQSxVQUFBLEdBQWEsWUFBWSxDQUFDLGVBQWIsSUFDVCxNQUFNLENBQUM7TUFDWCxHQUFBLEdBQ08sWUFBWSxDQUFDLGFBQWhCLEdBQ0ksWUFBWSxDQUFDLEdBQUcsQ0FBQyxPQUFqQixDQUNRLElBQUEsTUFBQSxDQUFPLEdBQUEsR0FBSSxZQUFZLENBQUMsYUFBakIsR0FBK0IsR0FBdEMsQ0FEUixFQUVJLEVBRkosQ0FESixHQU1JLFlBQVksQ0FBQztNQUVyQixLQUFBLEdBQVEsVUFBVSxDQUFDLEtBQVgsQ0FBQTtNQUNSLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBbkIsQ0FDSSxZQUFZLENBQUMsWUFBYixDQUNJLEdBREosRUFFSSxDQUFDLENBQUMsTUFBRixDQUFTLFlBQVQsRUFBdUIsZUFBdkIsQ0FGSixFQUdJLFVBQVcsQ0FBQSxZQUFZLENBQUMsSUFBYixDQUhmLENBREosRUFNSSxFQU5KLEVBT0k7UUFBQSxJQUFBLEVBQVEsWUFBWSxDQUFDLElBQXJCO1FBQ0EsS0FBQSxFQUFRLENBQUMsQ0FBQyxNQUFGLENBQ0osWUFBWSxDQUFDLFVBQWIsSUFBMkIsRUFEdkIsRUFFSjtVQUFBLGFBQUEsRUFBZ0IsWUFBWSxDQUFDLGFBQTdCO1VBQ0EsVUFBQSxFQUFnQixZQUFZLENBQUMsVUFEN0I7U0FGSSxDQURSO09BUEosRUFhSSxZQUFZLENBQUMsWUFiakIsQ0FlQSxDQUFDLElBZkQsQ0FlTSxTQUFDLEdBQUQ7UUFDRixrQkFBRyxHQUFHLENBQUUsY0FBUjtVQUNJLFlBQVksQ0FBQyxLQUFiLENBQW1CLEdBQW5CO2lCQUNBLEtBQUssQ0FBQyxNQUFOLENBQWEsR0FBYixFQUZKO1NBQUEsTUFBQTtVQUlJLFlBQVksQ0FBQyxPQUFiLENBQXFCLEdBQXJCO2lCQUNBLEtBQUssQ0FBQyxPQUFOLENBQWMsR0FBZCxFQUxKOztNQURFLENBZk4sRUFzQkUsU0FBQyxHQUFEO1FBQ0UsWUFBWSxDQUFDLEtBQWIsQ0FBbUIsR0FBbkI7ZUFDQSxLQUFLLENBQUMsTUFBTixDQUFhLEdBQWI7TUFGRixDQXRCRjtNQTBCQSxJQUFHLENBQUMsQ0FBQyxVQUFGLENBQWEsS0FBSyxDQUFDLE9BQW5CLENBQUg7ZUFDSSxNQURKO09BQUEsTUFFSyxJQUFHLENBQUMsQ0FBQyxRQUFGLENBQVcsS0FBSyxDQUFDLE9BQWpCLENBQUg7ZUFDRCxLQUFLLENBQUMsUUFETDs7SUE1Q087SUFpRFY7OztNQUVZLG9CQUFDLFVBQUQsRUFBYSxPQUFiOztVQUFhLFVBQVU7O1FBQ2pDLDZDQUFBLFNBQUE7UUFDQSxJQUFBLENBQU8sT0FBTyxDQUFDLFVBQWY7VUFDSSxJQUFDLENBQUEsb0JBQUQsQ0FBQSxFQURKOztNQUZVOzsyQkFNZCxJQUFBLEdBQU8sU0FBQyxNQUFELEVBQVMsS0FBVCxFQUFnQixPQUFoQjs7VUFBZ0IsVUFBVTs7ZUFDN0IscUNBQU0sTUFBTixFQUFjLEtBQWQsRUFDSSxDQUFDLENBQUMsTUFBRixDQUFTLGtCQUFBLENBQW1CLE1BQW5CLEVBQTJCLEtBQTNCLEVBQWtDLE9BQWxDLENBQVQsRUFDSTtVQUFBLGFBQUEsRUFBZ0IsS0FBSyxDQUFDLEVBQXRCO1NBREosQ0FESjtNQURHOzsyQkFLUCxvQkFBQSxHQUF1QixTQUFBO1FBQ25CLElBQUcsSUFBQyxDQUFBLFVBQUo7QUFDSSxpQkFBTyxPQUFPLENBQUMsSUFBUixDQUFhLGlHQUFBLEdBR29CLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFIakMsR0FHc0MsOEJBSHRDLEdBS2IsSUFBQyxDQUFBLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFMWCxHQUtnQixHQUw3QixFQURYOztRQVNBLElBQ0ksQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULEVBQVksU0FBWixDQUFBLElBQ0EsQ0FBQyxJQUFDLENBQUEsVUFBRCxJQUFlLE1BQU0sQ0FBQyxVQUF2QixDQUZKO2lCQUlJLGVBQWUsQ0FBQyxJQUFoQixDQUFxQixJQUFyQixFQUpKO1NBQUEsTUFBQTtpQkFNSSxPQUFPLENBQUMsSUFBUixDQUFhLGlHQUFBLEdBRzJCLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFIeEMsR0FHNkMsMEVBSDFELEVBTko7O01BVm1COzsyQkF3QnZCLFlBQUEsR0FBZTs7OztPQXJDTSxRQUFRLENBQUM7SUF5QzVCOzs7TUFFWSx5QkFBQTtRQUNWLGtEQUFBLFNBQUE7UUFDQSxJQUFDLENBQUEsb0JBQUQsQ0FBQTtNQUZVOztnQ0FJZCxLQUFBLEdBQVE7O2dDQUVSLElBQUEsR0FBUSxTQUFDLE1BQUQsRUFBUyxVQUFULEVBQXFCLE9BQXJCOztVQUFxQixVQUFVOztlQUNuQywwQ0FBTSxNQUFOLEVBQWMsVUFBZCxFQUNJLGtCQUFBLENBQW1CLE1BQW5CLEVBQTJCLFVBQTNCLEVBQXVDLE9BQXZDLENBREo7TUFESTs7Z0NBSVIsb0JBQUEsR0FBdUIsU0FBQTtRQUNuQixJQUNJLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxFQUFZLEtBQVosQ0FBQSxJQUNBLENBQUMsSUFBQyxDQUFBLFVBQUQsSUFBZSxNQUFNLENBQUMsVUFBdkIsQ0FGSjtpQkFJSSxlQUFlLENBQUMsSUFBaEIsQ0FBcUIsSUFBckIsRUFKSjtTQUFBLE1BQUE7aUJBTUksT0FBTyxDQUFDLElBQVIsQ0FBYSxpR0FBQSxHQUcyQixJQUFDLENBQUEsV0FBVyxDQUFDLElBSHhDLEdBRzZDLHNFQUgxRCxFQU5KOztNQURtQjs7Z0NBZXZCLFlBQUEsR0FBZTs7OztPQTNCVyxRQUFRLENBQUM7V0ErQnZDLENBQUMsVUFBRCxFQUFhLGVBQWI7RUEzTE07O0VBOExWLElBQUcsT0FBTyxNQUFQLEtBQWlCLFVBQWpCLElBQWtDLE1BQU0sQ0FBQyxHQUE1QztJQUNJLE1BQUEsQ0FBTyxDQUFDLFlBQUQsRUFBZSxVQUFmLEVBQTJCLFVBQTNCLENBQVAsRUFBK0MsU0FBQyxDQUFELEVBQUksUUFBSixFQUFjLFFBQWQ7QUFDM0MsVUFBQTthQUFBLE1BSUksT0FBQSxDQUFRLE1BQVIsRUFBZ0IsQ0FBaEIsRUFBbUIsUUFBbkIsRUFBNkIsUUFBN0IsQ0FKSixFQUNJLE1BQU0sQ0FBQyxRQUFRLENBQUMsbUJBRHBCLEVBRUksTUFBTSxDQUFDLFFBQVEsQ0FBQyx3QkFGcEIsRUFBQTtJQUQyQyxDQUEvQyxFQURKO0dBQUEsTUFRSyxJQUFHLE9BQU8sTUFBUCxLQUFtQixXQUFuQixJQUFxQyxNQUFNLENBQUMsT0FBL0M7SUFDRCxDQUFBLEdBQUksT0FBQSxDQUFRLFlBQVI7SUFDSixRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7SUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7SUFDWCxNQUFNLENBQUMsT0FBUCxHQUFpQixPQUFBLENBQVEsTUFBUixFQUFnQixDQUFoQixFQUFtQixRQUFuQixFQUE2QixRQUE3QixFQUpoQjtHQUFBLE1BQUE7SUFPRCxNQUlJLE9BQUEsQ0FBUSxNQUFSLEVBQWdCLE1BQU0sQ0FBQyxDQUF2QixFQUEwQixNQUFNLENBQUMsUUFBakMsRUFBMkMsUUFBM0MsQ0FKSixFQUNJLE1BQU0sQ0FBQyxRQUFRLENBQUMsbUJBRHBCLEVBRUksTUFBTSxDQUFDLFFBQVEsQ0FBQyx5QkFUbkI7O0FBdk1MIiwiZmlsZSI6ImJhY2tib25lLndhbXAuanMiLCJzb3VyY2VSb290IjoiLi8ifQ==