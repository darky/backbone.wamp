(function() {
  var Backbone, _, autobahn, factory, global, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  global = (function() {
    return this;
  })();

  factory = function(global, _, Backbone, autobahn) {
    var WAMP_Collection, WAMP_Model, action_map, attach_handlers, backbone_ajax_original, mixin_wamp_options, wamp_get_uri;
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
          var get_uri;
          get_uri = _.has(_this, "wamp_get_uri") || _.has(_this.constructor.prototype, "wamp_get_uri") ? _this.wamp_get_uri : global.WAMP_GET_URI || _this.wamp_get_uri;
          return connection.session.register(get_uri.call(_this, _.result(_this, "url") || _.result(_this, "urlRoot"), _.result(_this, "wamp_my_id") || global.WAMP_MY_ID, action), function(args, kwargs, details) {
            var name;
            if (kwargs.data) {
              kwargs.data = JSON.parse(kwargs.data);
            }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhY2tib25lLndhbXAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwyQ0FBQTtJQUFBOytCQUFBOztBQUFBLEVBQUEsTUFBQSxHQUFZLENBQUEsU0FBQSxHQUFBO1dBQUcsS0FBSDtFQUFBLENBQUEsQ0FBSCxDQUFBLENBQVQsQ0FBQTs7QUFBQSxFQUNBLE9BQUEsR0FBVSxTQUFDLE1BQUQsRUFBUyxDQUFULEVBQVksUUFBWixFQUFzQixRQUF0QixHQUFBO0FBRU4sUUFBQSxrSEFBQTtBQUFBLElBQUEsVUFBQSxHQUNJO0FBQUEsTUFBQSxNQUFBLEVBQVcsUUFBWDtBQUFBLE1BQ0EsS0FBQSxFQUFXLFFBRFg7QUFBQSxNQUVBLE9BQUEsRUFBVyxPQUZYO0FBQUEsTUFHQSxRQUFBLEVBQVcsUUFIWDtBQUFBLE1BSUEsS0FBQSxFQUFXLE1BSlg7S0FESixDQUFBO0FBQUEsSUFPQSxlQUFBLEdBQWtCLFNBQUEsR0FBQTtBQUNkLFVBQUEsVUFBQTtBQUFBLE1BQUEsVUFBQSxHQUFhLElBQUMsQ0FBQSxlQUFELElBQW9CLE1BQU0sQ0FBQyxlQUF4QyxDQUFBO2FBRUEsQ0FBQyxDQUFDLElBQUYsQ0FDSSxDQUFDLENBQUMsTUFBRixDQUFTLFVBQVQsQ0FESixFQUVJLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE1BQUQsR0FBQTtBQUNJLGNBQUEsT0FBQTtBQUFBLFVBQUEsT0FBQSxHQUVRLENBQUMsQ0FBQyxHQUFGLENBQU0sS0FBTixFQUFTLGNBQVQsQ0FBQSxJQUNBLENBQUMsQ0FBQyxHQUFGLENBQU0sS0FBQyxDQUFBLFdBQVcsQ0FBQSxTQUFsQixFQUFzQixjQUF0QixDQUZKLEdBSUksS0FBQyxDQUFBLFlBSkwsR0FNSSxNQUFNLENBQUMsWUFBUCxJQUF1QixLQUFDLENBQUEsWUFQaEMsQ0FBQTtpQkFTQSxVQUFVLENBQUMsT0FBTyxDQUFDLFFBQW5CLENBQ0ksT0FBTyxDQUFDLElBQVIsQ0FDSSxLQURKLEVB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