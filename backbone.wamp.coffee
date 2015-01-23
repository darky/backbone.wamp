do (
    global = @
    factory = (_, Backbone, autobahn)->

        action_map =
            "POST"   : "create"
            "PUT"    : "update"
            "PATCH"  : "patch"
            "DELETE" : "delete"
            "GET"    : "read"

        backbone_ajax_original = Backbone.ajax

        Backbone.ajax = (ajax_options)->
            switch true
                when ajax_options.wamp_model
                    "TODO"
                when ajax_options.wamp_collection
                    "TODO"
                else
                    backbone_ajax_original ajax_options



        class WAMP_Model extends Backbone.Model

            sync : (method, model, options = {})->
                super method, model,
                    _.extend options, wamp_model : true



        class WAMP_Collection extends Backbone.Collection

            model : WAMP_Model

            sync  : (method, collection, options = {})->
                super method, collection,
                    _.extend options, wamp_collection : true



        [WAMP_Model, WAMP_Collection]

) ->

    if typeof define is "function"  and  define.amd
        define ["underscore", "backbone", "autobahn"], (_, Backbone, autobahn)->
            [
                global.Backbone.WAMP_Model
                global.Backbone.WAMP_Collection
            ] =
                factory _, Backbone, autobahn

    else if typeof module isnt "undefined"  and  module.exports
        _ = require "underscore"
        Backbone = require "backbone"
        autobahn = require "autobahn"
        module.exports = factory _, Backbone, autobahn

    else
        [
            global.Backbone.WAMP_Model
            global.Backbone.WAMP_Collection
        ] =
            factory global._, global.Backbone, autobahn