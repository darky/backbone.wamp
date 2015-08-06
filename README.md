# Backbone.WAMP

[![](https://travis-ci.org/darrrk/backbone.wamp.svg?branch=master)](https://travis-ci.org/darrrk/backbone.wamp)

Backbone.WAMP replace your classic **REST** protocol, based on **AJAX**, to modern **WAMP** protocol, based on **WebSockets**.
You can read more about <a href=http://wamp.ws target=_blank>here</a>.

## Dependencies

*Backbone*<br>
*AutobahnJS*<br>

## Overview example

```javascript
/************
   browser
************/

window.WAMP_OTHER_ID = "nodejs";
window.WAMP_CONNECTION = new autobahn.Connection({
  url: "ws://127.0.0.1:9000/ws",
  realm: "realm1"
});

WAMP_CONNECTION.onopen = function () {
  var Collection = WampCollection.extend({
    url: "test_collection"
  });
  var collection = new Collection();
  collection.fetch(); // call wampRead below
  collection.create({ // call wampCreate below
    age: 36,
    name: "John"
  }, {
    success: function () {
      collection.first().destroy(); // call wampDelete below
    }
  });
};

WAMP_CONNECTION.open();



/**********
   nodejs
**********/

global.WAMP_MY_ID = "nodejs";
global.WAMP_CONNECTION = new autobahn.Connection({
  url: "ws://127.0.0.1:9000/ws",
  realm: "realm1"
});

WAMP_CONNECTION.onopen = function () {
  var Collection = WampCollection.extend({
    url: "test_collection",
    wampRead: function () {
      // called via fetch
      // need return data or promise
    },
    wampCreate: function (sendOptions) {
      sendOptions.data.age === 36; // true
      sendOptions.data.name === "John"; // true
      // need return data or promise
    },
    wampDelete: function (sendOptions) {
      // sendOptions.extra.wampModelId contain id of model
      // need return data or promise
    }
  });

  collection = new Collection();
};

WAMP_CONNECTION.open();
```

## API

#### wampConnection / WAMP_CONNECTION

Before create instances of `WampModel` / `WampCollection`,
you need eastablish autobahn connection and link it to global `WAMP_CONNECTION` or
specific `wampConnection` for `WampModel` / `WampCollection`.

```javascript
window.WAMP_CONNECTION = new autobahn.Connection({
  url: "ws://127.0.0.1:9000/ws",
  realm: "realm1"
});

var wampConnection = new autobahn.Connection({
  url: "ws://127.0.0.1:9000/ws",
  realm: "realm2"
});

WAMP_CONNECTION.onopen = function () {
  var Collection = WampCollection.extend({
    url: "test_collection"
  });
  var collection = new Collection(); // this collection used WAMP_CONNECTION
};

wampConnection.onopen = function () {
  var Collection = WampCollection.extend({
    url: "test_collection2"
    wampConnection: wampConnection
  });
  var collection = new Collection(); // this collection used wampConnection
}

WAMP_CONNECTION.open();
wampConnection.open();
```

#### wampMyId / WAMP_MY_ID

This unique peer-id of current environment,
with which you want interact from other environments.

```javascript
global.WAMP_MY_ID = "nodejs";
global.WAMP_CONNECTION = new autobahn.Connection({
  url: "ws://127.0.0.1:9000/ws",
  realm: "realm1"
});

WAMP_CONNECTION.onopen = function () {
  var Collection = WampCollection.extend({
    url: "test_collection",
  });

  var Model = WampModel.extend({
    urlRoot: "test_model"
    wampMyId: "nodejs2"
  });

  var collection = new Collection(); // this available on "nodejs"
  var model = new Model(); // this available on "nodejs2"
};

WAMP_CONNECTION.open();
```

#### wampOtherId / WAMP_OTHER_ID

This means peer-id of environment, with which you want interact from current environment.

```javascript
window.WAMP_OTHER_ID = "nodejs";
window.WAMP_CONNECTION = new autobahn.Connection({
  url: "ws://127.0.0.1:9000/ws",
  realm: "realm1"
});

WAMP_CONNECTION.onopen = function () {
  var Collection = WampCollection.extend({
    url: "test_collection",
  });

  var Model = WampModel.extend({
    urlRoot: "test_model"
    wampOtherId: "nodejs2"
  });

  var collection = new Collection(); // this will interact with "nodejs"
  var model = new Model(); // this will interact with "nodejs2"
};

WAMP_CONNECTION.open();
```

#### constructor

When you create instances of `WampModel` / `WampCollection`, this automatically
register listeners, using `wampMyId` / `WAMP_MY_ID` and `urlRoot` / `url`, if it present.<br>
For ignoring this, need pass to `constructor` - `wampNoAttach` option.<br>
For catching each registering need pass to `constructor` - `wampRegister` callback-option.

```javascript
window.WAMP_CONNECTION = new autobahn.Connection({
  url: "ws://127.0.0.1:9000/ws",
  realm: "realm1"
});

WAMP_CONNECTION.onopen = function () {
  var Collection = WampCollection.extend({
    url: "test_collection",
  });

  var Model = WampModel.extend({
    wampMyId: "browser"
  });

  var Model2 = WampModel.extend({
    urlRoot: "model2",
    wampMyId: "browser"
  })

  var collection = new Collection(); // no register listeners, wampMyId / WAMP_MY_ID ommited
  var model = new Model(); // no register listeners, urlRoot ommited
  var model2 = new Model2({}, {wampNoAttach: true}); // no register listeners, pass specific option
  model2 = new Model2({}, {wampRegister: function (errOrReg) { // register listeners
    // calling for registering each action: create | read | update | delete | patch
  }})
};

WAMP_CONNECTION.open();
```

#### wampCreate, wampRead, wampUpdate, wampDelete, wampPatch

This hooks automatically registers, when create instances of `WampModel` / `WampCollection`,
if exists `wampMyId` / `WAMP_MY_ID` and `urlRoot` / `url` and not pass `wampNoAttach` option.

###### Received param: `sendOptions`

`sendOptions.data` contains JSON-parsed model for *create*, *update*, *patch* actions.
Or GET-params for *read* action of model/collection.<br>
`sendOptions.extra` contain any extra information, which you can send in `options.wampExtra`<br>
Built-in options in `sendOptions.extra`:

* `wampModelId` of specific model, if needed
* `wampMyId` of another environment

###### Return

Need return data or promise, that resolved to data.<br>
For error need return `new autobahn.Error(...)` or promise, that resolve `new autobahn.Error(...)`<br>
For example, see **Overview example** above.

#### wampGetUri / WAMP_GET_URI

By default, via methods `save`, `fetch`, e.t.c. generated WebSocket messages as is `peerId.uri.action`<br>
Example: "nodejs.test_collection.create"<br>
You can overwrite template if needed via `wampGetUri` / `WAMP_GET_URI`, that 

###### Received params: peerId, uri, action

###### Return: string of WebSocket message

#### wampAuth / WAMP_AUTH

When defined, will be called before **wampCreate, wampRead, wampUpdate, wampDelete, wampPatch**.<br>
If it's return non true value or promise, that resolved to non true,
**wampCreate, wampRead, wampUpdate, wampDelete, wampPatch** not be called.

###### Received params: uriOptions, sendOptions

`uriOptions` contain peerId, uri, action

more about `sendOptions`in **wampCreate, wampRead, ...** partition

###### Return: true or promise, that resolved to true (if auth passed)

```javascript
global.WAMP_MY_ID = "nodejs";
global.WAMP_CONNECTION = new autobahn.Connection({
  url: "ws://127.0.0.1:9000/ws",
  realm: "realm1"
});

WAMP_CONNECTION.onopen = function () {
  var Collection = WampCollection.extend({
    url: "test_collection",
    wampAuth: function (uriOptions, sendOptions) {
      // it pseudo code with concept
      return new Promise(function (resolve) {
        db.find({peer: sendOptions.extra.wampMyId}).then(function (finded) {
          resolve(finded) // if finded === true, auth passed
        })
      });
    },
    wampRead: function () {
      // this called, if wampAuth return promise, that resolved to true
    }
  });

  var collection = new Collection();
};

WAMP_CONNECTION.open();
```

##### Session

This can be useful for `wampAuth`.<br>
For session mechanism need dynamically generate `wampMyId`.<br>
Example: `browser_0dbee552-46e0-4c7c-aa4e-e1341dc00b18`<br>
Use any UUID, GUID, e.t.c. generator, maybe [node-uuid](https://github.com/broofa/node-uuid)


#### wampUnregister

Call this method directly on instances of `WampModel` / `WampCollection` for unregistering
**wampCreate, wampRead, ...** methods.

###### Received params: actions, callback

`actions` it array, for example `["read", "delete"]`<br>
If omitted, will unregister all actions

`callback` called per each unregistering action

```javascript
global.WAMP_MY_ID = "nodejs";
global.WAMP_CONNECTION = new autobahn.Connection({
  url: "ws://127.0.0.1:9000/ws",
  realm: "realm1"
});

WAMP_CONNECTION.onopen = function () {
  var Collection = WampCollection.extend({
    url: "test_collection"
  });

  var collection = new Collection();
  collection.wampUnregister(null, function (err, uri) {
    // called per each unregistering action
  });
};

WAMP_CONNECTION.open();
```

## License

(The MIT License)

Copyright (c) 2015 Vladislav Botvin &lt;darkvlados@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


### License of AutobahnJS

Copyright (c) 2011-2014 Tavendo GmbH.

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.