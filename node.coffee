autobahn = require "autobahn"
Backbone = require "backbone"
[WAMP_Model, WAMP_Collection] = require "./backbone.wamp.coffee"

global.WAMP_CONNECTION = new autobahn.Connection
    url   : "ws://127.0.0.1:8080/ws"
    realm : "realm1"

global.WAMP_CONNECTION.onopen = ->
    class Collection extends WAMP_Collection

        wamp_my_id : "nodejs"
        
        url : "test_collection"

        wamp_read : (options, autobahn)->
            {data, extra} = options

            if extra.wamp_model_id
                {id: 1, name: "John", age: 25}
            else if extra.wamp_model_id is null
                {id: 1, name: "John", age: 20}
            else
                [{a: 1, b: 2}, {c: 1, d: 2}]

            console.log arguments
            [{a: 1, b: 2}, {c: 1, d: 2}]




    c = new Collection()


global.WAMP_CONNECTION.open()