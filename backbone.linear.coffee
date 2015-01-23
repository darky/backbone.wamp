do (
    global = @
    factory = (_, Backbone, autobahn)->

        class WAMP_Model extends Backbone.Model

        class WAMP_Collection extends Backbone.Collection

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