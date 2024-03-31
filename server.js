
var http = require('http');
var MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
var server = require('websocket').server;
var db; 

mongoose.connection.on('connected', () => console.log('connected'));
mongoose.connection.on('open', () => console.log('open'));
mongoose.connection.on('disconnected', () => console.log('disconnected'));
mongoose.connection.on('reconnected', () => console.log('reconnected'));
mongoose.connection.on('disconnecting', () => console.log('disconnecting'));
mongoose.connection.on('close', () => console.log('close'));

startMongoDBConnection();

function startMongoDBConnection(){  
  const connectionStr = "mongodb+srv://<username>:<password>@<atlas cluster>/?retryWrites=true&w=majority&appName=<atlas cluster name>"; 
  mongoose.set("strictQuery", true); 
  const options = { 
  }; 
  
  mongoose.connect(connectionStr, options);
  db = mongoose.connection.useDb('playerDB', { useCache: true });
  startWebSocketServer(db);
}


function startWebSocketServer(db){
  var connections = new Set(); // Storage of connections
  var socket = new server({
    httpServer: http.createServer().listen(9230)
  });
  
  console.log("WebSocket running on ws://localhost:9230");
  
  socket.on('request', function(request) {
    var connection = request.accept(null, request.origin);
    //console.log('request........');
    //for (const i in request) {
      //console.log(request[i]);
    //}
    
    connections.add(connection);
    
    
    connection.on('message', function(message) {
	const payload = JSON.parse(message['utf8Data']);
	var name = payload["name"];
        if(payload["function"] == "find") {
            const collection = db.collection("playerCredit");
            var query = { _id : name };
            collection.findOne(query, function(err, doc) { 
            //console.log(doc);
            connection.send(JSON.stringify(doc));
          });
        } else if(payload["function"] == "modify") {
          console.log("modify");
          const collection = db.collection("playerCredit");
          var query = { _id : name };
          const updateDoc = { $inc : { validCredit: 1 } };

          // The following updateOptions document specifies that we want the *updated*
          // document to be returned. By default, we get the document as it was *before*
          // the update.
          const updateOptions = { includeResultMetadata: true, returnDocument: "after" };
 
          collection.findOneAndUpdate(query,updateDoc,updateOptions, function(err, result) {

          if(err) {
            console.error(`Something went wrong trying to update one document: ${err}\n`);
          }
          connection.send(JSON.stringify(result));
        });
        }
    });

    connection.on('close', function() {
      connections.delete(connection);
    });
  });
  
}

