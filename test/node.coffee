autobahn = require "autobahn"
_ = require "underscore"
Backbone = require "backbone"
WAMPModel = require("../../backbone.wamp.js").Model
WAMPCollection = require("../../backbone.wamp.js").Collection

global.WAMP_CONNECTION = new autobahn.Connection
    url   : "ws://127.0.0.1:9000/ws"
    realm : "realm1"
global.WAMP_MY_ID = "nodejs"

global.WAMP_CONNECTION.onopen = ->

    class Model extends WAMPModel

        urlRoot : "test_model"

        wampRead : (options)->
            @toJSON()

        wampCreate : (options)->
            {data, extra} = options

            if extra.check_error
                return new autobahn.Error "sync error"

            @set _.extend(
                data
                id   : parseInt _.uniqueId()
            )
            @toJSON()

        wampUpdate : (options)->
            {data, extra} = options

            @set _.extend data, type : "update"
            @toJSON()

        wampPatch : (options)->
            {data, extra} = options

            @set _.extend data, type : "patch"
            @toJSON()

        wampDelete : (options)->
            {extra} = options

            @set {}
            {}



    class Collection extends WAMPCollection
        
        url : "test_collection"

        wampRead : (options)->
            {extra} = options

            if extra.wampModelId
                @get extra.wampModelId
                .toJSON()
            else
                @toJSON()

        wampCreate : (options, details)->
            {data, extra} = options

            switch true
                when extra.check_success_promise
                    deferred = global.WAMP_CONNECTION.defer()
                    _.defer =>
                        @add _.extend(
                            data
                            id           : parseInt _.uniqueId()
                            wampExtra   : extra.check_it
                            wampOptions : !!details.progress
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
                        wampExtra   : extra.check_it
                        wampOptions : !!details.progress
                    )
                    @last().toJSON()

        wampUpdate : (options)->
            {data, extra} = options

            @get extra.wampModelId
            .set _.extend(
                data
                type : "update"
            )

        wampPatch : (options)->
            {data, extra} = options

            @get extra.wampModelId
            .set _.extend data, type : "patch"

        wampDelete : (options)->
            {extra} = options

            @remove @get extra.wampModelId
            {}

    class Collection_URI extends WAMPCollection

        url : "qweqwe"

        wampGetUri : (uri, peer_id, action)->
            "custom_uri.#{action}"

        wampRead : ->
            [custom_uri : true]

    class Collection_Auth extends WAMPCollection

        url : "auth_collection"

        wampAuth : (uri, wampMyId, action, kwargs, details)->
            defer = global.WAMP_CONNECTION.defer()
            defer.resolve kwargs.data?.auth
            defer.promise

        wampRead : ->
            [{auth : true}]

    m = new Model
    c = new Collection
    c_uri = new Collection_URI
    c_auth = new Collection_Auth


global.WAMP_CONNECTION.open()
