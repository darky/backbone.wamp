describe "backbone.wamp tests", ->
    global = do -> @
    Model = null
    Collection = null
    model = null
    collection = null

    before (done)->
        @timeout 10000
        global.WAMP_MY_ID = "browser"
        global.WAMP_OTHER_ID = "nodejs"
        global.WAMP_CONNECTION = new autobahn.Connection
            url   : "ws://127.0.0.1:9000/ws"
            realm : "realm1"
        global.WAMP_CONNECTION.onopen = ->

            class Model extends Backbone.WAMP_Model

                urlRoot : "test_model"


            class Collection extends Backbone.WAMP_Collection

                url : "test_collection"


            model = new Model()
            collection = new Collection()

            _.delay done, 2000

        global.WAMP_CONNECTION.open()

    it "Not register CRUD hooks", (done)->
        chai.expect global.WAMP_CONNECTION.session.registrations.length
        .equal 10

        class M extends Model

            urlRoot : null


        m = new M()
        m.wamp_attach_handlers()


        class C extends Collection

            url : null


        c = new C()
        c.wamp_attach_handlers()

        global.WAMP_MY_ID = null

        m = new Model()
        m.wamp_attach_handlers()

        c = new Collection()
        c.wamp_attach_handlers()

        c.add {a: 1}
        c.at(0).wamp_attach_handlers()

        global.WAMP_MY_ID = "browser"

        _.delay ->
            chai.expect global.WAMP_CONNECTION.session.registrations.length
            .equal 10
            done()
        , 1900

    it "wamp_connection property", (done)->
        connection = new autobahn.Connection
            url   : "ws://127.0.0.1:9000/ws"
            realm : "realm2"
        connection.onopen = ->
            class M extends Model

                wamp_connection : connection

                urlRoot : "test_model_realm2"


            m = new M()

            _.delay ->
                registrations = _.filter(
                    connection.session.registrations
                    (reg)-> !!reg.procedure.match /^test_model_realm2/
                )

                chai.expect(
                    _.all registrations, (reg)-> reg.session.realm is "realm2"
                )
                .true

                done()
            , 1500
        connection.open()

    it "wamp_my_id property", (done)->
        class M extends Model

            wamp_my_id : "browser2"


        m = new M()

        _.delay ->
            chai.expect(
                _.filter(
                    global.WAMP_CONNECTION.session.registrations, (reg)->
                        !!reg.procedure.match /^test_model\.browser2/
                )
                .length
            )
            .equal 5
            done()
        ,
            1500

    it "wamp_other_id property", (done)->
        class M extends Model

            wamp_other_id : "nodejs2"

            urlRoot : "test_model2"


        m = new M()

        m.fetch error : (m, err, opts)->
            chai.expect opts.wamp_other_id
            .equal "nodejs2"

            done()


    it "wamp_get_uri property", (done)->
        class C extends Collection

            url : "qweqwe"

            wamp_attach_handlers : ->

            wamp_get_uri : (uri, wamp_id, action)->
                "custom_uri.#{action}"

        c = new C()

        c.fetch success : (c)->
            chai.expect c.at(0).get("custom_uri")
            .true
            done()

    it "model create", (done)->
        model.once "sync", (some..., opts)->
            chai.expect model.id
            .ok

            chai.expect opts.wamp_my_id
            .equal "browser"

            done()

        model.save a : 1

    it "model update", (done)->
        model.once "sync", (some..., opts)->
            chai.expect model.get "a"
            .equal 2

            chai.expect model.get "type"
            .equal "update"

            chai.expect opts.wamp_model_id
            .ok

            chai.expect opts.wamp_my_id
            .equal "browser"

            done()

        model.save a : 2

    it "model patch", (done)->
        model.once "sync", (some..., opts)->
            chai.expect model.get "b"
            .equal 6

            chai.expect model.get "type"
            .equal "patch"

            chai.expect opts.wamp_model_id
            .ok

            chai.expect opts.wamp_my_id
            .equal "browser"

            chai.expect opts.patch
            .true

            done()

        model.save
            b : 6
        ,
            patch : true

    it "model fetch", (done)->
        data = model.toJSON()
        model.once "sync", (m, resp, opts)->
            chai.expect opts.wamp_model_id
            .ok

            chai.expect opts.wamp_my_id
            .equal "browser"

            chai.expect data
            .deep.equal resp

            done()
        model.fetch()

    it "model destroy", (done)->
        model.once "destroy", (m, resp, opts)->
            chai.expect opts.wamp_model_id
            .ok

            chai.expect opts.wamp_my_id
            .equal "browser"

            chai.expect _.size resp
            .equal 0

            done()

        model.destroy()

    it "collection model create", (done)->
        collection.once "sync", ->
            chai.expect collection.first().id
            .ok

            chai.expect collection.first().get "a"
            .equal 1

            done()
        collection.create a : 1

    it "collection model update", (done)->
        collection.once "sync", (m, resp, opts)->
            chai.expect collection.at(0).get "b"
            .equal 1

            chai.expect collection.at(0).get "type"
            .equal "update"

            chai.expect opts.wamp_model_id
            .ok

            chai.expect opts.wamp_my_id
            .equal "browser"

            done()

        collection.at(0).save b : 1

    it "collection model patch", (done)->
        collection.once "sync", (m, resp, opts)->
            chai.expect collection.at(0).get "b"
            .equal 2

            chai.expect collection.at(0).get "type"
            .equal "patch"

            chai.expect opts.patch
            .true

            chai.expect opts.wamp_model_id
            .ok

            chai.expect opts.wamp_my_id
            .equal "browser"

            done()

        collection.at(0).save
            b : 2
        ,
            patch : true

    it "collection model fetch", (done)->
        data = collection.at(0).toJSON()
        collection.once "sync", (c, resp, opts)->
            chai.expect opts.wamp_model_id
            .ok

            chai.expect opts.wamp_my_id
            .equal "browser"

            chai.expect data
            .deep.equal resp

            done()
        collection.at(0).fetch()

    it "collection fetch", (done)->
        data = collection.toJSON()
        collection.once "sync", (c, resp, opts)->
            chai.expect opts.wamp_my_id
            .equal "browser"

            chai.expect data
            .deep.equal resp

            done()
        collection.fetch()

    it "collection model destroy", (done)->
        collection.once "destroy", (c, resp, opts)->
            chai.expect opts.wamp_model_id
            .ok

            chai.expect opts.wamp_my_id
            .equal "browser"

            chai.expect collection.length
            .equal 0

            done()
        collection.at(0).destroy()

    it "wamp_extra", (done)->
        collection.once "sync", ->
            chai.expect collection.last().get "wamp_extra"
            .true

            done()

        collection.create
            a : 1
        ,
            wamp_extra : check_it : true

    it "wamp_options", (done)->
        collection.once "sync", ->
            chai.expect collection.last().get "wamp_options"
            .true

            done()

        collection.create
            a : 1
        ,
            wamp_options : receive_progress : true

    it "success callback", (done)->
        collection.create
            a : 1
        ,
            success : -> done()

    it "success callback promise", (done)->
        collection.create
            a : 1
        ,
            success    : -> done()
            wamp_extra : check_success_promise : true

    it "error callback", (done)->
        collection.create
            a : 1
        ,
            error      : -> done()
            wamp_extra : check_error : true

    it "error callback promise", (done)->
        collection.create
            a : 1
        ,
            error      : -> done()
            wamp_extra : check_error_promise : true

    it "success promise", (done)->
        model.save a : 1
        .then -> done()

    it "error promise", (done)->
        model.save
            a  : 1
            id : null
        ,
            wamp_extra : check_error : true
        .then(
            ->
            -> done()
        )

    it "test promises engines", (done)->
        @timeout 10000
        tests = _.filter @test.parent.tests, (test)->
            test.title in ["success promise", "error promise"]
        async.eachSeries(
            [
                use_deferred     : $.Deferred
            ,
                use_deferred     : Q.defer
            ,
                use_es6_promises : true
            ]
            (opts, next)=>
                global.WAMP_CONNECTION = new autobahn.Connection(
                    _.extend
                        url   : "ws://127.0.0.1:9000/ws"
                        realm : "realm1"
                    ,
                        opts
                )
                global.WAMP_CONNECTION.onopen = =>
                    async.eachSeries tests, (test, next)=>
                        test.fn.call @, next
                    ,
                        next
                global.WAMP_CONNECTION.open()
            done
        )
