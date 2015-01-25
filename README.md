# Backbone.WAMP

Backbone.WAMP replace your classic **REST** protocol, based on **AJAX**, to modern **WAMP** protocol, based on **WebSockets**.
You can read more about <a href=http://wamp.ws target=_blank>here</a>. This allows make your *Backbone.Model* / *Backbone.Collection* with next characteristics:

#### Peer-to-peer

No client-server architecture.
Frontend can save changes to server <-> Server can push changes to client.
Frontend can fetch data from server <-> Server can fetch data from frontend.
And even, frontend/backend can interact with other frontend/backend respectively.

#### Isomorphic

Identical *Models* / *Collections* everywhere. You can even share it between peers.

#### Increase speed

**Websockets** seems faster than **AJAX** 10-20%

## Dependencies

**UMD**. <br>
Suitable in **Browser** / **CommonJS** / **AMD** enviroments. <br>
Deps - *Backbone* / *Underscore* / *<a href=http://autobahn.ws/js/index.html target=_blank>AutobahnJS</a>*. <br>
I recommend to learn *AutobahnJS* before, it's not long and difficult.

## Before using

Before create your first object of class, extended from *Backbone.WAMP_Model* / *Backbone.WAMP_Collection*,
you should **initialize and establish** <a href=http://autobahn.ws/js/reference.html#connections target=_blank>AutobahnJS connection</a> to peer.
This connection need to save in global variable `WAMP_CONNECTION`. Or/and you can save particular connections in
`wamp_connection` property of *Backbone.WAMP_Model* / *Backbone.WAMP_Collection* extended classes,
which will be incapsulated inside them. 

## How it works

### Send WebSocket interaction

1. Extend own class from *Backbone.WAMP_Model* / *Backbone.WAMP_Collection*
2. In class set `url` for Collection or `urlRoot` for standalone Model.
3. Set global variable `WAMP_OTHER_ID` or property/method (which should return string property)
`wamp_other_id` for specific class. Meant unique peer id of enviroment, which you want interact.
4. Do `fetch`, `save`, `destroy`. It generate WebSocket messages as `entity.peer_id.CRUD_action`. More info below.

### Receive WebSocket interaction

Your instances of classes, extended from *Backbone.WAMP_Model* / *Backbone.WAMP_Collection* register 5 **CRUD** callback-methods:
`wamp_create`, `wamp_read`, `wamp_update`, `wamp_delete`, `wamp_patch`,
that called via WebSocket messages, as `entity.peer_id.CRUD_action`, where:

* `entity` - `urlRoot` of *Backbone.WAMP_Model*, `url` of *Backbone.WAMP_Collection* <br>
* `peer_id` - unique peer id of your enviroment, for example: *browser*, *nodejs*, *nodejs_2*<br>
It sets via global `WAMP_MY_ID` variable,
and/or `wamp_my_id` property/method of specific class.
* `CRUD_action` - *create*, *read*, *update*, *delete*, *patch*

Methods `wamp_create`, e.t.c receive 2 parameters: `send_options`, `autobahn_details`<br>

* `send_options.data` contains JSON-parsed model for *create*, *update*, *patch*.
Or GET-params for *read* model/collection
* `send_options.extra` - contain extra information, which you can send in `options.wamp_extra`<br>
Built-in options in `send_options.extra`:

    * `wamp_model_id` of specific model, if needed.
    * `wamp_my_id` of another enviroment

* `autobahn_details` can contain AutobahnJS <a href=http://autobahn.ws/js/reference.html#call target=_blank>session.call options</a>,
which can sended in `options.wamp_options`

Methods `wamp_create`, e.t.c should do specific action in our enviroment and return Model/Collection data or Promise,
that resolve this data. For error you can reject returned Promise with cause.

## License

(The MIT License)

Copyright (c) 2014-2015 Vladislav Botvin &lt;darkvlados@gmail.com&gt;

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