do (
    global = @
    factory = (_, Backbone, autobahn)->

        backbone_ajax_original = Backbone.ajax

        Backbone.ajax = (ajax_options)->
            if ajax_options.wamp
                "TODO"
            else
                backbone_ajax_original ajax_options



        class WAMP_Model extends Backbone.Model

            sync : (method, model, options = {})->
                super method, model,
                    _.extend options, wamp : true



        class WAMP_Collection extends Backbone.Collection

            model : WAMP_Model

            sync  : (method, model, options = {})->
                super method, model,
                    _.extend options, wamp : true



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