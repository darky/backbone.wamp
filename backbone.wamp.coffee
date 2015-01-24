do (
    global = do -> @
    factory = (global, _, Backbone, autobahn)->

        action_map =
            "POST"   : "create"
            "PUT"    : "update"
            "PATCH"  : "patch"
            "DELETE" : "delete"
            "GET"    : "read"

        backbone_ajax_original = Backbone.ajax

        Backbone.ajax = (ajax_options)->
            if not ajax_options.wamp_model and not ajax_options.wamp_collection
                return backbone_ajax_original ajax_options

            connection = ajax_options.wamp_connection or
                global.WAMP_CONNECTION

            if ajax_options.wamp_model
                "TODO"
            else if ajax_options.wamp_collection
                connection.session.call(
                    """
                        #{ajax_options.url}.\
                        #{_.result ajax_options, "wamp_other_id"}.\
                        #{action_map[ajax_options.type]}
                    """
                    []
                    ajax_options.data
                    ajax_options.wamp_options
                ).then ajax_options.success, ajax_options.error



        class WAMP_Model extends Backbone.Model

            sync : (method, model, options = {})->
                super method, model,
                    _.extend options,
                        wamp_connection : model.wamp_connection
                        wamp_model      : true
                        wamp_model_id   : model.id



        class WAMP_Collection extends Backbone.Collection

            constructor : ->
                connection = @wamp_connection or global.WAMP_CONNECTION

                _.each(
                    _.values action_map
                    (action)=>
                        connection.session.register """
                            #{_.result @, "url"}.\
                            #{_.result @, "wamp_my_id"}.\
                            #{action}
                        """, =>
                            @["wamp_#{action}"] _.rest(arguments)...
                )

                super

            model : WAMP_Model

            sync  : (method, collection, options = {})->
                super method, collection,
                    _.extend options,
                        wamp_collection : true
                        wamp_connection : collection.wamp_connection
                        wamp_other_id   : collection.wamp_other_id



        [WAMP_Model, WAMP_Collection]

) ->

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