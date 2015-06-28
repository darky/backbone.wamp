global = do -> @
factory = (global, _, Backbone, autobahn)->

    action_map =
        "POST"   : "create"
        "PUT"    : "update"
        "PATCH"  : "patch"
        "DELETE" : "delete"
        "GET"    : "read"

    actions = _.values action_map

    attach_handlers = (uri_key)->
        uri = _.result @, uri_key
        wamp_my_id = _.result(@, "wamp_my_id") or global.WAMP_MY_ID

        if not uri or not wamp_my_id then return

        connection = @wamp_connection or global.WAMP_CONNECTION
        get_uri = @wamp_get_uri or global.WAMP_GET_URI or wamp_get_uri
        wamp_auth = @wamp_auth or global.WAMP_AUTH or ->
            defer = connection.defer()
            defer.resolve true
            if _.isFunction defer.promise
                defer
            else if _.isObject defer.promise
                defer.promise

        _.each actions, (action)=>
            connection.session.register if 1
                get_uri.call @, uri, wamp_my_id, action
            ,
                (args, kwargs, details)=>
                    defer = connection.defer()

                    wamp_auth uri, wamp_my_id, action, kwargs, details
                    .then (is_auth)=>
                        if is_auth is true
                            try kwargs.data = JSON.parse kwargs.data
                            action_result = @["wamp_#{action}"]? kwargs, details

                            if typeof action_result?.then is "function"
                                action_result.then (result)->
                                    defer.resolve result
                            else if action_result?
                                defer.resolve action_result
                            else
                                defer.resolve new autobahn.Error "
                                    Not defined procedure for action: #{action}
                                "
                        else
                            defer.resolve new autobahn.Error "Auth error"

                    if _.isFunction defer.promise
                        defer
                    else if _.isObject defer.promise
                        defer.promise

    mixin_wamp_options = (method, entity, options)->
        _.extend options,
            wamp            : true
            wamp_connection : entity.wamp_connection
            wamp_get_uri    : _.bind if 1
                entity.wamp_get_uri or
                global.WAMP_GET_URI or
                wamp_get_uri
            ,
                entity
            wamp_my_id      : entity.collection?.wamp_my_id or
                entity.wamp_my_id or global.WAMP_MY_ID
            wamp_other_id   : entity.collection?.wamp_other_id or
                entity.wamp_other_id or global.WAMP_OTHER_ID

    wamp_get_uri = (uri, peer_id, action)->
        """
            #{uri}.\
            #{peer_id}.\
            #{action}
        """

    backbone_ajax_original = Backbone.ajax

    Backbone.ajax = (ajax_options)->
        unless ajax_options.wamp
            return backbone_ajax_original ajax_options

        connection = ajax_options.wamp_connection or global.WAMP_CONNECTION

        uri =
            if ajax_options.wamp_model_id
                ajax_options.url.replace if 1
                    new RegExp "/#{ajax_options.wamp_model_id}$"
                ,
                    ""
            else
                ajax_options.url

        defer = connection.defer()

        connection.session.call if 1
            ajax_options.wamp_get_uri uri,
                _.result ajax_options, "wamp_other_id"
                action_map[ajax_options.type]
        ,
            []
            data  : ajax_options.data
            extra : _.extend if 1
                ajax_options.wamp_extra or {}
            ,
                wamp_model_id : ajax_options.wamp_model_id
                wamp_my_id    : ajax_options.wamp_my_id
            ajax_options.wamp_options
        .then (obj)->
            if obj?.error
                ajax_options.error obj
                defer.reject obj
            else
                ajax_options.success obj
                defer.resolve obj
        , (obj)->
            ajax_options.error obj
            defer.reject obj

        if _.isFunction defer.promise
            defer
        else if _.isObject defer.promise
            defer.promise



    class WAMP_Model extends Backbone.Model

        constructor : (attributes, options = {})->
            super
            unless options.collection
                attach_handlers.call @, "urlRoot"


        sync : (method, model, options = {})->
            super method, model,
                _.extend if 1
                    mixin_wamp_options method, model, options
                ,
                    wamp_model_id : model.id



    class WAMP_Collection extends Backbone.Collection

        constructor : ->
            super
            attach_handlers.call @, "url"

        model : WAMP_Model

        sync  : (method, collection, options = {})->
            super method, collection,
                mixin_wamp_options method, collection, options



    [WAMP_Model, WAMP_Collection]



if typeof define is "function"  and  define.amd
    define ["underscore", "backbone", "autobahn"], (_, Backbone, autobahn)->
        [
            global.Backbone.WAMP_Model
            global.Backbone.WAMP_Collection
        ] =
            factory global, _, Backbone, autobahn

else if typeof module isnt "undefined"  and  module.exports
    _ = require "underscore"
    Backbone = require "backbone"
    autobahn = require "autobahn"
    module.exports = factory global, _, Backbone, autobahn

else
    [
        global.Backbone.WAMP_Model
        global.Backbone.WAMP_Collection
    ] =
        factory global, global._, global.Backbone, autobahn
