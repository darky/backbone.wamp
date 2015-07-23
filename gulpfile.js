/* *****************
#    DEFINE-VARS
# *************** */
var _ = require("underscore"),
  gulp = require("gulp"),
  exec = require("child_process").exec,
  KarmaServer = require("karma").Server,
  mocha_phantomjs = require("gulp-mocha-phantomjs");


/* ******************
#    CONCAT-TASKS
# **************** */
gulp.task("default", ["test", "lint"]);
gulp.task("test", [
    "test-backbone",
    "test-own"
]);


/* *********
#    TEST
# ******* */
gulp.task("test-backbone", function (cb) {
  new KarmaServer({
    browsers: ["Firefox"],
    coverageReporter: {
      dir: "coverage-backbone",
      subdir: ".",
      type: "json"
    },
    files: [
      "bower_components/underscore/underscore.js",
      "bower_components/jquery/dist/jquery.js",
      "bower_components/backbone/backbone.js",
      "bower_components/autobahn/autobahn.js",
      "backbone.wamp.js",
      "backbone-test/setup/dom-setup.js",
      "backbone-test/setup/environment.js",
      "backbone-test/noconflict.js",
      "backbone-test/events.js",
      "backbone-test/model.js",
      "backbone-test/collection.js",
      "backbone-test/router.js",
      "backbone-test/view.js",
      "backbone-test/sync.js"
    ],
    frameworks: ["qunit"],
    preprocessors: {
      "backbone.wamp.js": "coverage"
    },
    reporters: ["progress", "coverage"],
    singleRun: true
  }, cb).start();
});

gulp.task("test-own-crossbar", function (cb) {
  exec("crossbar start &");
  _.delay(cb, 10000);
});

gulp.task("test-own", ["test-own-crossbar"], function (cb) {
  var stream = mocha_phantomjs();
  stream.write({path: "http://127.0.0.1:9000/test/"});
  stream.end();
  return stream;
});


/* ***********
#    LINT
# ********* */
gulp.task("lint", function (cb) {
  cb();
});
