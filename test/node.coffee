autobahn = require "autobahn"
_ = require "underscore"
Backbone = require "backbone"
[WAMP_Model, WAMP_Collection] = require "../../backbone.wamp.js"

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
            {data, extra} = options

            if extra.check_error
                return new autobahn.Error "sync error"

            @set _.extend(
                data
                id   : parseInt _.uniqueId()
            )
            @toJSON()

        wamp_update : (options)->
            {data, extra} = options

            @set _.extend data, type : "update"
            @toJSON()

        wamp_patch : (options)->
            {data, extra} = options

            @set _.extend data, type : "patch"
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

        wamp_create : (options, details)->
            {data, extra} = options

            switch true
                when extra.check_success_promise
                    deferred = global.WAMP_CONNECTION.defer()
                    _.defer =>
                        @add _.extend(
                            data
                            id           : parseInt _.uniqueId()
                            wamp_extra   : extra.check_it
                            wamp_options : !!details.progress
                        )
                        deferred.resolve @last().toJSON()
                    deferred.promise
                when extra.check_error
                    new autobahn.Error "sync error"
                when extra.check_error_promise
                    deferred = global.WAMP_CONNECTION.defer()
                    _.defer ->
                        deferred.resolve new autobahn.Error "promise error"
                    deferred.promise
                else
                    @add _.extend(
                        data
                        id           : parseInt _.uniqueId()
                        wamp_extra   : extra.check_it
                        wamp_options : !!details.progress
                    )
                    @last().toJSON()

        wamp_update : (options)->
            {data, extra} = options

            @get extra.wamp_model_id
            .set _.extend(
                data
                type : "update"
            )

        wamp_patch : (options)->
            {data, extra} = options

            @get extra.wamp_model_id
            .set _.extend data, type : "patch"

        wamp_delete : (options)->
            {extra} = options

            @remove @get extra.wamp_model_id
            {}

    class Collection_URI extends WAMP_Collection

        url : "qweqwe"

        wamp_get_uri : (uri, peer_id, action)->
            "custom_uri.#{action}"

        wamp_read : ->
            [custom_uri : true]


    m = new Model()
    c = new Collection()
    c_uri = new Collection_URI()


global.WAMP_CONNECTION.open()
