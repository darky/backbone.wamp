/* eslint-env amd, browser, mocha, jquery */
/* global _, async, autobahn, Backbone, chai, Q, requirejs */

describe("backbone.wamp tests", function () { // eslint-disable-line
  "use strict";

  var global = typeof global !== "undefined" ? global : window,
    Model, Collection, model, collection;

  before(function (done) {
    this.timeout(10000);
    global.WAMP_MY_ID = "browser";
    global.WAMP_OTHER_ID = "nodejs";
    global.WAMP_CONNECTION = new autobahn.Connection({
      realm: "realm1",
      url: "ws://127.0.0.1:9000/ws"
    });
    global.WAMP_CONNECTION.onopen = function () {
      Model = Backbone.WampModel.extend({
        urlRoot: "testModel"
      });
      Collection = Backbone.WampCollection.extend({
        url: "testCollection"
      });
      model = new Model();
      collection = new Collection();
      _.delay(done, 2000);
    };
    global.WAMP_CONNECTION.open();
  });

  it("Native backbone.ajax", function (done) {
    var C = Backbone.Collection.extend({
      url: "/qwe"
    }),
      c = new C();
    c.fetch({error: function (col, xhr) {
      chai.expect(xhr.status).equal(404);
      done();
    }});
  });

  it("Not register CRUD hooks", function (done) {
    var obj = {},
      M = Model.extend({
        urlRoot: null
      }),
      C = Collection.extend({
        url: null
      });
    chai.expect(global.WAMP_CONNECTION.session.registrations.length)
    .equal(10);
    _.each([M, C, Model, Collection], function (Klass) {
      if (Klass === Model || Klass === Collection) {
        global.WAMP_MY_ID = null;
      }
      obj[Klass] = new Klass();
    });
    obj[Collection].add({a: 1});
    global.WAMP_MY_ID = "browser";
    _.delay(function () {
      chai.expect(global.WAMP_CONNECTION.session.registrations.length)
      .equal(10);
      done();
    }, 1900);
  });

  it("Ignore register CRUD hooks", function () {
    var col = new Collection([], {wampNoAttach: true});
    chai.expect(global.WAMP_CONNECTION.session.registrations.length)
    .equal(10);
  });

  it("wampUnregister method", function (done) {
    var Col = Collection.extend({
      url: "qweqwe"
    }),
      col = new Col(),
      tryDone = _.after(7, function () {
        chai.expect(global.WAMP_CONNECTION.session.registrations.length)
        .equal(10);
        done();
      });
    this.timeout(4000);
    _.delay(function () {
      col.wampUnregister(["read", "create"], tryDone);
      col.wampUnregister(null, tryDone);
    }, 2000);
  });

  it("wampConnection property", function (done) {
    var connection = new autobahn.Connection({
      realm: "realm2",
      url: "ws://127.0.0.1:9000/ws"
    });
    connection.onopen = function () {
      var m, M; // eslint-disable-line no-unused-vars, no-inline-comments
      M = Model.extend({
        urlRoot: "testModelRealm2",
        wampConnection: connection
      });
      m = new M();
      _.delay(function () {
        var registrations = _.filter(connection.session.registrations, function (reg) {
          return !!reg.procedure.match(/^testModelRealm2/);
        });
        chai.expect(_.all(registrations, function (reg) {
          return reg.session.realm === "realm2";
        }))
        .equal(true);
        done();
      }, 1500);
      connection.open();
    };
    connection.open();
  });

  it("wampMyId property", function (done) {
    var m, M; // eslint-disable-line no-unused-vars, no-inline-comments
    M = Model.extend({
      wampMyId: "browser2"
    });
    m = new M();
    _.delay(function () {
      chai.expect(_.filter(
        global.WAMP_CONNECTION.session.registrations,
        function (reg) {
          return !!reg.procedure.match(/^testModel\.browser2/);
        }
      ).length)
      .equal(5);
      done();
    }, 1500);
  });

  it("wampMyId collection property", function (done) {
    var c, C;
    C = Collection.extend({
      model: Model,
      wampMyId: "browser"
    });
    c = new C();
    c.add([{a: 1}]);
    c.at(0).fetch({
      success: function () {
        done();
      }
    });
  });

  it("wampOtherId property", function (done) {
    var c, C;
    C = Collection.extend({
      wampOtherId: "nodejs2",
      url: "qweqwe"
    });
    c = new C();
    c.fetch({
      success: function () {
        chai.expect(c.at(0).get("ok")).equal(true);
        done();
      }
    });
  });

  it("wampOtherId collection property", function (done) {
    var c, C;
    C = Collection.extend({
      wampOtherId: "nodejs2",
      url: "qweqwe"
    });
    c = new C();
    c.add([{}]);
    c.at(0).fetch({
      success: function () {
        done();
      }
    });
  });

  it("wampGetUri property", function (done) {
    var c, C;
    C = Collection.extend({
      url: "qweqwe",
      wampGetUri: function (uri, peerId, action) {
        return "customUri." + action;
      }
    });
    c = new C();
    c.fetch({
      success: function () {
        chai.expect(c.at(0).get("customUri")).equal(true);
        done();
      }
    });
  });

  it("global WAMP_GET_URI", function (done) {
    var C = Collection.extend({
      url: "qweqwe"
    }),
      c;
    global.WAMP_GET_URI = function (uri, peerId, action) {
      return "customUri." + action;
    };
    c = new C();
    c.fetch({
      success: function () {
        chai.expect(c.at(0).get("customUri")).equal(true);
        global.WAMP_GET_URI = null;
        done();
      }
    });
  });

  it("model create", function (done) {
    model.once("sync", function (m) {
      chai.expect(!!m.id).equal(true);
      done();
    });
    model.save({a: 1});
  });

  it("model update", function (done) {
    model.once("sync", function (m, resp, opts) {
      chai.expect(m.get("a")).equal(2);
      chai.expect(m.get("type")).equal("update");
      chai.expect(!!opts.wampModelId).equal(true);
      done();
    });
    model.save({a: 2});
  });

  it("model patch", function (done) {
    model.once("sync", function (m, resp, opts) {
      chai.expect(m.get("b")).equal(6);
      chai.expect(m.get("type")).equal("patch");
      chai.expect(!!opts.wampModelId).equal(true);
      chai.expect(opts.patch).equal(true);
      done();
    });
    model.save({
      b: 6
    }, {
      patch: true
    });
  });

  it("model fetch", function (done) {
    var data = model.toJSON();
    model.once("sync", function (m, resp, opts) {
      chai.expect(!!opts.wampModelId).equal(true);
      chai.expect(data).deep.equal(resp);
      done();
    });
    model.fetch();
  });

  it("model destroy", function (done) {
    model.once("destroy", function (m, resp, opts) {
      chai.expect(!!opts.wampModelId).equal(true);
      chai.expect(_.size(resp))
      .equal(0);
      done();
    });
    model.destroy();
  });

  it("collection model create", function (done) {
    collection.once("sync", function () {
      chai.expect(!!collection.first().id).equal(true);
      chai.expect(collection.first().get("a")).equal(1);
      done();
    });
    collection.create({a: 1});
  });

  it("collection model update", function (done) {
    collection.once("sync", function (m, resp, opts) {
      chai.expect(collection.at(0).get("b")).equal(1);
      chai.expect(collection.at(0).get("type")).equal("update");
      chai.expect(!!opts.wampModelId).equal(true);
      done();
    });
    collection.at(0).save({b: 1});
  });

  it("collection model patch", function (done) {
    collection.once("sync", function (m, resp, opts) {
      chai.expect(collection.at(0).get("b")).equal(2);
      chai.expect(collection.at(0).get("type")).equal("patch");
      chai.expect(opts.patch).equal(true);
      chai.expect(!!opts.wampModelId).equal(true);
      done();
    });
    collection.at(0).save({
      b: 2
    }, {
      patch: true
    });
  });

  it("collection model fetch", function (done) {
    var data = collection.at(0).toJSON();
    collection.once("sync", function (c, resp, opts) {
      chai.expect(!!opts.wampModelId).equal(true);
      chai.expect(data).deep.equal(resp);
      done();
    });
    collection.at(0).fetch();
  });

  it("collection fetch", function (done) {
    var data = collection.toJSON();
    collection.once("sync", function (c, resp) {
      chai.expect(data).deep.equal(resp);
      done();
    });
    collection.fetch();
  });

  it("collection model destroy", function (done) {
    collection.once("destroy", function (c, resp, opts) {
      chai.expect(!!opts.wampModelId).equal(true);
      chai.expect(collection.length).equal(0);
      done();
    });
    collection.at(0).destroy();
  });

  it("wampExtra", function (done) {
    collection.once("sync", function () {
      chai.expect(collection.last().get("wampExtra")).equal(true);
      done();
    });
    collection.create({a: 1}, {
      wampExtra: {
        checkIt: true
      }
    });
  });

  it("wampOptions", function (done) {
    collection.once("sync", function () {
      chai.expect(collection.last().get("wampOptions")).equal(true);
      done();
    });
    collection.create({a: 1}, {
      wampOptions: {
        receive_progress: true // eslint-disable-line
      }
    });
  });

  it("success callback", function (done) {
    collection.create({a: 1}, {
      success: function () {
        done();
      }
    });
  });

  it("success callback promise", function (done) {
    collection.create({a: 1}, {
      success: function () {
        done();
      },
      wampExtra: {
        checkSuccessPromise: true
      }
    });
  });

  it("error callback", function (done) {
    collection.create({a: 1}, {
      error: function () {
        done();
      },
      wampExtra: {
        checkError: true
      }
    });
  });

  it("error callback promise", function (done) {
    collection.create({a: 1}, {
      error: function () {
        done();
      },
      wampExtra: {
        checkErrorPromise: true
      }
    });
  });

  it("success promise", function (done) {
    model.save({a: 1})
    .then(function () {
      done();
    });
  });

  it("error promise", function (done) {
    model.save({
      a: 1,
      id: null
    }, {
      wampExtra: {
        checkError: true
      }
    }).then(_.noop, function () {
      done();
    });
  });

  it("test promises engines", function (done) {
    var tests, self = this;
    this.timeout(10000);
    tests = _.filter(this.test.parent.tests, function (test) {
      return test.title === "success promise" || test.title === "error promise";
    });
    async.eachSeries([{
      use_deferred: $.Deferred // eslint-disable-line
    }, {
      use_deferred: Q.defer // eslint-disable-line
    }, {
      use_es6_promises: true // eslint-disable-line
    }], function (opts, next) {
      global.WAMP_CONNECTION = new autobahn.Connection(_.extend({
        realm: "realm1",
        url: "ws://127.0.0.1:9000/ws"
      }, opts));
      global.WAMP_CONNECTION.onopen = function () {
        async.eachSeries(tests, function (test, nextTest) {
          test.fn.call(self, nextTest);
        }, next);
      };
      global.WAMP_CONNECTION.open();
    }, done);
  });

  it("auth not passed", function (done) {
    var c, C;
    C = Collection.extend({
      url: "authCollection"
    });
    c = new C();
    c.fetch({
      error: function (col, obj) {
        chai.expect(obj.error)
        .equal("Auth error");
        done();
      }
    });
  });

  it("auth passed", function (done) {
    var c, C;
    C = Collection.extend({
      url: "authCollection"
    });
    c = new C();
    c.fetch({
      data: {
        auth: true
      },
      success: function () {
        chai.expect(c.at(0).get("auth"))
        .equal(true);
        done();
      }
    });
  });

  it("Not defined for action", function (done) {
    var C = Collection.extend({
      url: "noAction"
    }),
      c = new C();
    c.fetch({
      error: function (col, resp) {
        chai.expect(resp.error).equal(
          "Not defined procedure for action: read"
        );
        done();
      }
    });
  });

  it("Not defined procedure", function (done) {
    var C = Collection.extend({
      url: "notExist"
    }),
      c = new C();
    c.fetch({
      error: function () {
        done();
      }
    });
  });

  it("check AMD", function (done) {
    requirejs.config({
      paths: {
        autobahn: "base/bower_components/autobahn/autobahn",
        backbone: "base/bower_components/backbone/backbone",
        jquery: "base/bower_components/jquery/dist/jquery",
        underscore: "base/bower_components/underscore/underscore"
      }
    });

    require(["base/backbone.wamp.js"], function (WampClasses) {
      chai.expect(WampClasses.Model).equal(Backbone.WampModel);
      chai.expect(WampClasses.Collection).equal(Backbone.WampCollection);
      done();
    });
  });
});
