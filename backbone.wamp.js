(function () {
  "use strict";

  var globalVar = typeof global !== "undefined" ? global : window,
    imported,
    factory = function (_, Backbone, autobahn) {
      var actionMap = {
        POST: "create",
        PUT: "update",
        PATCH: "patch",
        DELETE: "delete",
        GET: "read"
      },

        actions = _.values(actionMap),

        attachHandlers = function (uriKey) {
          var self = this,
            uri = _.result(this, uriKey),
            wampMyId = _.result(this, "wampMyId") || globalVar.WAMP_MY_ID,
            connection, getUri, wampAuth;
          if (!uri || !wampMyId) {
            return;
          }
          connection = this.wampConnection || globalVar.WAMP_CONNECTION;
          getUri = this.wampGetUri || globalVar.WAMP_GET_URI || wampGetUri;
          wampAuth = this.wampAuth || globalVar.WAMP_AUTH || function () {
            var defer = connection.defer();
            defer.resolve(true);
            if (_.isFunction(defer.promise)) {
              return defer;
            } else if (_.isObject(defer.promise)) {
              return defer.promise;
            }
          }
          _.each(actions, function (action) {
            connection.session.register(
              getUri.call(self, uri, wampMyId, action),
              function (args, kwargs, details) {
                var defer = connection.defer();
                wampAuth(uri, wampMyId, action, kwargs, details)
                .then(function (isAuth) {
                  var actionResult;
                  if (isAuth === true) {
                    try {
                      kwargs.data = JSON.parse(kwargs.data);
                    } catch (e) {}
                    if (_.isFunction(self["wamp" + capitalizeFirstLetter(action)])) {
                      actionResult = self["wamp" + capitalizeFirstLetter(action)](kwargs, details);
                    }
                    if (actionResult != null && typeof actionResult.then === "function") {
                      actionResult.then(function(result){
                        defer.resolve(result);
                      });
                    } else if (actionResult != null) {
                      defer.resolve(actionResult);
                    } else {
                      defer.resolve(new autobahn.Error("Not defined procedure for action: " + action));
                    }
                  } else {
                    defer.resolve(new autobahn.Error("Auth error"));
                  }
                });
                if (_.isFunction(defer.promise)) {
                  return defer;
                } else if (_.isObject(defer.promise)) {
                  return defer.promise;
                }
              }
            );
          });
        },

        backboneAjaxOriginal = Backbone.ajax,

        capitalizeFirstLetter = function (string) {
          return string.charAt(0).toUpperCase() + string.slice(1);
        },

        mixinWampOptions = function (method, entity, options) {
          var collectionWampMyId = entity.collection ? entity.collection.wampMyId : null,
            collectionWampOtherId = entity.collection ? entity.collection.wampOtherId : null;
          return _.extend(options, {
            wamp: true,
            wampConnection: entity.wampConnection,
            wampGetUri: _.bind(entity.wampGetUri || globalVar.WAMP_GET_URI || wampGetUri, entity),
            wampMyId: collectionWampMyId || entity.wampMyId || globalVar.WAMP_MY_ID,
            wampOtherId: collectionWampOtherId || entity.wampOtherId || globalVar.WAMP_OTHER_ID
          });
        },

        wampGetUri = function (uri, peerId, action) {
          return uri + "." + peerId + "." + action;
        },


        WampModel = Backbone.Model.extend({
          constructor: function (attributes, options) {
            if (options == null) {
              options = {};
            }
            Backbone.Model.call(this, attributes, options);
            if (!options.collection) {
              attachHandlers.call(this, "urlRoot");
            }
          },
          sync: function (method, model, options) {
            if (options == null) {
              options = {};
            }
            return Backbone.Model.prototype.sync.call(this, method, model, _.extend(
              mixinWampOptions(method, model, options),
              {wampModelId: model.id}
            ));
          }
        }),

        WampCollection = Backbone.Collection.extend({
          constructor: function () {
            Backbone.Collection.apply(this, arguments);
            attachHandlers.call(this, "url");
          },
          model: WampModel,
          sync: function (method, collection, options) {
            if (options == null) {
              options = {};
            }
            return Backbone.Collection.prototype.sync.call(this, method, collection,
              mixinWampOptions(method, collection, options)
            );
          }
        });


      Backbone.ajax = function (ajaxOptions) {
        var connection, uri, defer;
        if (!ajaxOptions.wamp) {
          return backboneAjaxOriginal(ajaxOptions);
        }
        connection = ajaxOptions.wampConnection || globalVar.WAMP_CONNECTION;
        if (ajaxOptions.wampModelId) {
          uri = ajaxOptions.url.replace(new RegExp("/" + ajaxOptions.wampModelId + "$"), "");
        } else {
          uri = ajaxOptions.url;
        }
        defer = connection.defer();
        connection.session.call(
          ajaxOptions.wampGetUri(
            uri,
            _.result(ajaxOptions, "wampOtherId"),
            actionMap[ajaxOptions.type]
          ),
          [],
          {
            data: ajaxOptions.data,
            extra: _.extend(
              ajaxOptions.wampExtra || {},
              {
                wampModelId: ajaxOptions.wampModelId,
                wampMyId: ajaxOptions.wampMyId
              }
            )
          },
          ajaxOptions.wampOptions
        )
        .then(function (obj) {
          var objError = obj ? obj.error : null
          if (objError) {
            ajaxOptions.error(obj);
            defer.reject(obj);
          } else {
            ajaxOptions.success(obj);
            defer.resolve(obj);
          }
        }, function (obj) {
          ajaxOptions.error(obj);
          defer.reject(obj);
        });

        if (_.isFunction(defer.promise)) {
          return defer;
        } else if (_.isObject(defer.promise)) {
          return defer.promise;
        }
      };

      return {
        Model: WampModel,
        Collection: WampCollection
      };
    };

  if (typeof define === "function" && define.amd) {
    define(["underscore", "backbone", "autobahn"], function (_, Backbone, autobahn) {
      imported = factory(_, Backbone, autobahn);
      globalVar.Backbone.WampModel = imported.Model;
      globalVar.Backbone.WampCollection = imported.Collection;
    });
  } else if (typeof module !== "undefined" && module.exports) {
    module.exports = factory(
      require("underscore"),
      require("backbone"),
      require("autobahn")
    );
  } else {
    imported = factory(globalVar._, globalVar.Backbone, globalVar.autobahn);
    globalVar.Backbone.WampModel = imported.Model;
    globalVar.Backbone.WampCollection = imported.Collection;
  }

})();
