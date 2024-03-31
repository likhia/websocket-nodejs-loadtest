import ws from "k6/ws";
import { check } from "k6";

export default function() {
  var url = "ws://<Host Name of client VM>:9230/";
  
  var rnd = Math.floor(Math.random() * 1000000);

  var params = {transports: ["websocket"]};
  var loop = 10;
  var count = 0;	
  var response = ws.connect(url, params, function (socket) {
    
    socket.on('open', function open() {
      //console.log('connected');

      var message = { "function": "find", "name" : `P1name_${rnd}` };   
      //console.log(`Sending message : ${message}`);
      //socket.send(JSON.stringify(message));

      for(let i=0; i<loop; i++) { 
        rnd = Math.floor(Math.random() * 1000000);

	message = { "function": "find", "name" : `P1name_${rnd}` };
        //console.log(JSON.stringify(message));
	socket.send(JSON.stringify(message));
      }
    });

    socket.on('ping', function () {
      console.log("PING!");
    });

    socket.on('pong', function () {
      console.log("PONG!");
    });

    socket.on('pong', function () {
      console.log("OTHER PONG!");
    });

    socket.on('message', function (message) {
      //console.log(`Received message: ${message}`);
      count = count + 1;
      if(count == loop) {
      	  socket.close();
      }
    });

    socket.on('close', function () {
      //console.log('disconnected');
    });

    socket.on('error', function (e) {
      if (e.error() != "websocket: close sent") {
        console.log('An unexpected error occured: ', e.error());
      }
    });

    //socket.setTimeout(function () {
    //    console.log('10 seconds passed, closing the socket');
    //    socket.close();
    //}, 60000);
  });
  
  check(response, { "status is 101": (r) => r && r.status === 101 });
}

