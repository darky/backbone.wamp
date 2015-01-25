autobahn = require "autobahn"
_ = require "underscore"
Backbone = require "backbone"
[WAMP_Model, WAMP_Collection] = require "./backbone.wamp.coffee"

global.WAMP_CONNECTION = new autobahn.Connection
    url   : "ws://127.0.0.1:9000/ws"
    realm : "realm1"
global.WAMP_MY_ID = "nodejs"

global.WAMP_CONNECTION.onopen = ->

    class Model extends WAMP_Model

        urlRoot : "test_model"

        wamp_read : (options)->
            @toJSON()

        wamp_create : (options)->
            {data} = options

            @set _.extend(data, id : parseInt _.uniqueId())
            @toJSON()

        wamp_update : (options)->
            {data, extra} = options

            @set data
            @toJSON()

        wamp_patch : (options)->
            {data, extra} = options

            @set data
            @toJSON()

        wamp_delete : (options)->
            {extra} = options

            @set {}
            {}



    class Collection extends WAMP_Collection
        
        url : "test_collection"

        wamp_read : (options)->
            {extra} = options

            if extra.wamp_model_id
                @get extra.wamp_model_id
                .toJSON()
            else
                @toJSON()

        wamp_create : (options)->
            {data} = options

            @add _.extend(data, id : parseInt _.uniqueId())
            @last().toJSON()

        wamp_update : (options)->
            {data, extra} = options

            @get extra.wamp_model_id
            .set data

        wamp_patch : (options)->
            {data, extra} = options

            @get extra.wamp_model_id
            .set data

        wamp_delete : (options)->
            {extra} = options

            @remove @get extra.wamp_model_id
            {}


    m = new Model()
    c = new Collection()


global.WAMP_CONNECTION.open()