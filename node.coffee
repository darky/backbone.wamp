autobahn = require "autobahn"

connection = new autobahn.Connection
   url   : "ws://127.0.0.1:8080/ws"
   realm : "realm1"

connection.onopen = (session)->



connection.open()
