/* eslint-env node */

"use strict";

/* *****************
#    DEFINE-VARS
# *************** */
var _ = require("underscore"),
  gulp = require("gulp"),
  CheckCoverage = require("./node_modules/istanbul/lib/command/check-coverage.js"),
  combineCoverage = require("istanbul-combine"),
  eslint = require("gulp-eslint"),
  exec = require("child_process").exec,
  KarmaServer = require("karma").Server;


/* ******************
#    CONCAT-TASKS
# **************** */
gulp.task("default", ["coverage", "lint"]);
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

gulp.task("test-own", function (cb) {
  var crossbarProcess = exec("crossbar start");
  _.delay(function () {
    new KarmaServer({
      browsers: ["Firefox"],
      coverageReporter: {
        dir: "coverage-own",
        subdir: ".",
        type: "json"
      },
      files: [
        "bower_components/async/lib/async.js",
        "bower_components/autobahn/autobahn.js",
        "bower_components/underscore/underscore.js",
        "bower_components/jquery/dist/jquery.js",
        "bower_components/backbone/backbone.js",
        "bower_components/q/q.js",
        "backbone.wamp.js",
        "bower_components/requirejs/require.js",
        "test/browser.js"
      ],
      frameworks: ["chai", "mocha"],
      preprocessors: {
        "backbone.wamp.js": "coverage"
      },
      reporters: ["progress", "coverage"],
      singleRun: true
    }, function () {
      exec("ps -e | grep istanbul | sed \\$d | awk '{print $1}'", function (err, pid) {
        process.kill(parseInt(pid.trim(), 10), "SIGINT");
        crossbarProcess.kill();
        cb(err);
      });
    }).start();
  }, 10000);
});


/* *************
#    COVERAGE
# *********** */
gulp.task("coverage", ["test"], function (cb) {
  combineCoverage({
    pattern: "coverage-*/coverage*.json",
    reporters: {
      html: {
        dir: "coverage"
      },
      json: {
        dir: "coverage"
      }
    }
  }).then(function () {
    var checker = new CheckCoverage();
    checker.run([
      "--remain", "coverage/coverage-final.json",
      "--statements", "100",
      "--branches", "100",
      "--functions", "100",
      "--lines", "100"
    ], function (err) {
      cb(err);
    });
  });
});


/* ***********
#    LINT
# ********* */
gulp.task("lint", function () {
  return gulp.src(["*.js", "test/*.js"])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});
