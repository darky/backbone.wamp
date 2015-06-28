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
      var connection, get_uri, uri, wamp_my_id;
      connection = this.wamp_connection || global.WAMP_CONNECTION;
      get_uri = this.wamp_get_uri || global.WAMP_GET_URI || wamp_get_uri;
      uri = _.result(this, "url") || _.result(this, "urlRoot");
      wamp_my_id = _.result(this, "wamp_my_id") || global.WAMP_MY_ID;
      return _.each(actions, (function(_this) {
        return function(action) {
          return connection.session.register(1 ? get_uri.call(_this, uri, wamp_my_id, action) : void 0, function(args, kwargs, details) {
            var name;
            try {
              kwargs.data = JSON.parse(kwargs.data);
            } catch (_error) {}
            return (typeof _this[name = "wamp_" + action] === "function" ? _this[name](kwargs, details) : void 0) || new autobahn.Error(1 ? "Not defined procedure for action: " + action : void 0);
          });
        };
      })(this));
    };
    mixin_wamp_options = function(method, entity, options) {
      var ref, ref1;
      return _.extend(options, {
        wamp: true,
        wamp_connection: entity.wamp_connection,
        wamp_get_uri: _.bind(1 ? entity.wamp_get_uri || global.WAMP_GET_URI || wamp_get_uri : void 0, entity),
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
      uri = ajax_options.wamp_model_id ? ajax_options.url.replace(1 ? new RegExp("/" + ajax_options.wamp_model_id + "$") : void 0, "") : ajax_options.url;
      defer = connection.defer();
      connection.session.call(1 ? ajax_options.wamp_get_uri(uri, _.result(ajax_options, "wamp_other_id"), action_map[ajax_options.type]) : void 0, [], {
        data: ajax_options.data,
        extra: _.extend(1 ? ajax_options.wamp_extra || {} : void 0, {
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
        return WAMP_Model.__super__.sync.call(this, method, model, _.extend(1 ? mixin_wamp_options(method, model, options) : void 0, {
          wamp_model_id: model.id
        }));
      };

      WAMP_Model.prototype.wamp_attach_handlers = function() {
        if (_.result(this, "urlRoot") && (this.wamp_my_id || global.WAMP_MY_ID)) {
          return attach_handlers.call(this);
        } else {
          return console.warn("wamp_create, wamp_read, wamp_update, wamp_delete, wamp_patch handlers were not registered for `" + this.constructor.name + "`. Check `urlRoot` / global `WAMP_MY_ID` or `wamp_my_id` property/method");
        }
      };

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhY2tib25lLndhbXAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwyQ0FBQTtJQUFBOzs7RUFBQSxNQUFBLEdBQVksQ0FBQSxTQUFBO1dBQUc7RUFBSCxDQUFBLENBQUgsQ0FBQTs7RUFDVCxPQUFBLEdBQVUsU0FBQyxNQUFELEVBQVMsQ0FBVCxFQUFZLFFBQVosRUFBc0IsUUFBdEI7QUFFTixRQUFBO0lBQUEsVUFBQSxHQUNJO01BQUEsTUFBQSxFQUFXLFFBQVg7TUFDQSxLQUFBLEVBQVcsUUFEWDtNQUVBLE9BQUEsRUFBVyxPQUZYO01BR0EsUUFBQSxFQUFXLFFBSFg7TUFJQSxLQUFBLEVBQVcsTUFKWDs7SUFNSixPQUFBLEdBQVUsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxVQUFUO0lBRVYsZUFBQSxHQUFrQixTQUFBO0FBQ2QsVUFBQTtNQUFBLFVBQUEsR0FBYSxJQUFDLENBQUEsZUFBRCxJQUFvQixNQUFNLENBQUM7TUFDeEMsT0FBQSxHQUFVLElBQUMsQ0FBQSxZQUFELElBQWlCLE1BQU0sQ0FBQyxZQUF4QixJQUF3QztNQUNsRCxHQUFBLEdBQU0sQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULEVBQVksS0FBWixDQUFBLElBQXNCLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxFQUFZLFNBQVo7TUFDNUIsVUFBQSxHQUFhLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxFQUFZLFlBQVosQ0FBQSxJQUE2QixNQUFNLENBQUM7YUFFakQsQ0FBQyxDQUFDLElBQUYsQ0FBTyxPQUFQLEVBQWdCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxNQUFEO2lCQUNaLFVBQVUsQ0FBQyxPQUFPLENBQUMsUUFBbkIsQ0FBK0IsQ0FBSCxHQUN4QixPQUFPLENBQUMsSUFBUixDQUFhLEtBQWIsRUFBZ0IsR0FBaEIsRUFBcUIsVUFBckIsRUFBaUMsTUFBakMsQ0FEd0IsR0FBQSxNQUE1QixFQUdJLFNBQUMsSUFBRCxFQUFPLE1BQVAsRUFB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LENBQUEsb0JBQUQsQ0FBQTtNQUZVOztnQ0FJZCxLQUFBLEdBQVE7O2dDQUVSLElBQUEsR0FBUSxTQUFDLE1BQUQsRUFBUyxVQUFULEVBQXFCLE9BQXJCOztVQUFxQixVQUFVOztlQUNuQywwQ0FBTSxNQUFOLEVBQWMsVUFBZCxFQUNJLGtCQUFBLENBQW1CLE1BQW5CLEVBQTJCLFVBQTNCLEVBQXVDLE9BQXZDLENBREo7TUFESTs7Z0NBSVIsb0JBQUEsR0FBdUIsU0FBQTtRQUNuQixJQUNJLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxFQUFZLEtBQVosQ0FBQSxJQUNBLENBQUMsSUFBQyxDQUFBLFVBQUQsSUFBZSxNQUFNLENBQUMsVUFBdkIsQ0FGSjtpQkFJSSxlQUFlLENBQUMsSUFBaEIsQ0FBcUIsSUFBckIsRUFKSjtTQUFBLE1BQUE7aUJBTUksT0FBTyxDQUFDLElBQVIsQ0FBYSxpR0FBQSxHQUcyQixJQUFDLENBQUEsV0FBVyxDQUFDLElBSHhDLEdBRzZDLHNFQUgxRCxFQU5KOztNQURtQjs7OztPQVpHLFFBQVEsQ0FBQztXQTZCdkMsQ0FBQyxVQUFELEVBQWEsZUFBYjtFQWhLTTs7RUFvS1YsSUFBRyxPQUFPLE1BQVAsS0FBaUIsVUFBakIsSUFBa0MsTUFBTSxDQUFDLEdBQTVDO0lBQ0ksTUFBQSxDQUFPLENBQUMsWUFBRCxFQUFlLFVBQWYsRUFBMkIsVUFBM0IsQ0FBUCxFQUErQyxTQUFDLENBQUQsRUFBSSxRQUFKLEVBQWMsUUFBZDtBQUMzQyxVQUFBO2FBQUEsTUFJSSxPQUFBLENBQVEsTUFBUixFQUFnQixDQUFoQixFQUFtQixRQUFuQixFQUE2QixRQUE3QixDQUpKLEVBQ0ksTUFBTSxDQUFDLFFBQVEsQ0FBQyxtQkFEcEIsRUFFSSxNQUFNLENBQUMsUUFBUSxDQUFDLHdCQUZwQixFQUFBO0lBRDJDLENBQS9DLEVBREo7R0FBQSxNQVFLLElBQUcsT0FBTyxNQUFQLEtBQW1CLFdBQW5CLElBQXFDLE1BQU0sQ0FBQyxPQUEvQztJQUNELENBQUEsR0FBSSxPQUFBLENBQVEsWUFBUjtJQUNKLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjtJQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsVUFBUjtJQUNYLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLE9BQUEsQ0FBUSxNQUFSLEVBQWdCLENBQWhCLEVBQW1CLFFBQW5CLEVBQTZCLFFBQTdCLEVBSmhCO0dBQUEsTUFBQTtJQU9ELE1BSUksT0FBQSxDQUFRLE1BQVIsRUFBZ0IsTUFBTSxDQUFDLENBQXZCLEVBQTBCLE1BQU0sQ0FBQyxRQUFqQyxFQUEyQyxRQUEzQyxDQUpKLEVBQ0ksTUFBTSxDQUFDLFFBQVEsQ0FBQyxtQkFEcEIsRUFFSSxNQUFNLENBQUMsUUFBUSxDQUFDLHlCQVRuQjs7QUE3S0wiLCJmaWxlIjoiYmFja2JvbmUud2FtcC5qcyIsInNvdXJjZVJvb3QiOiIuLyJ9