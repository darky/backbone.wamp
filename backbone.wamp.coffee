do (
    global = do -> @
    factory = (global, _, Backbone, autobahn)->

        action_map =
            "POST"   : "create"
            "PUT"    : "update"
            "PATCH"  : "patch"
            "DELETE" : "delete"
            "GET"    : "read"

        mixin_wamp_options = (method, entity, options)->
            _.extend options,
                wamp            : true
                wamp_connection : entity.wamp_connection
                wamp_other_id   : entity.collection?.wamp_other_id or
                    entity.wamp_other_id

        backbone_ajax_original = Backbone.ajax

        Backbone.ajax = (ajax_options)->
            unless ajax_options.wamp
                return backbone_ajax_original ajax_options

            connection = ajax_options.wamp_connection or
                global.WAMP_CONNECTION
            uri =
                if ajax_options.wamp_model_id
                    ajax_options.url.replace(
                        new RegExp "/#{ajax_options.wamp_model_id}$"
                        ""
                    )
                else
                    ajax_options.url

            connection.session.call(
                """
                    #{uri}.\
                    #{_.result ajax_options, "wamp_other_id"}.\
                    #{action_map[ajax_options.type]}
                """
                []
                data  : ajax_options.data
                extra : _.extend(
                    ajax_options.wamp_extra or {}
                    wamp_model_id : ajax_options.wamp_model_id
                )
                ajax_options.wamp_options
            )
            .then ajax_options.success, ajax_options.error



        class WAMP_Model extends Backbone.Model

            sync : (method, model, options = {})->
                super method, model,
                    _.extend mixin_wamp_options(arguments...),
                        wamp_model_id : model.id



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
                        """, (args, kwargs, details)=>
                            if kwargs.data
                                kwargs.data = JSON.parse kwargs.data
                            @["wamp_#{action}"] kwargs, details
                )

                super

            model : WAMP_Model

            sync  : (method, collection, options = {})->
                super method, collection, mixin_wamp_options(arguments...)




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