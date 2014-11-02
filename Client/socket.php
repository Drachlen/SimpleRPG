<?php
  //node\bin\socket.io\support\socket.io-client
?>
<script src="http://127.0.0.1:8080/node/bin/socket.io/support/socket.io-client/socket.io.js"></script> 
<script> 
 var socket = new io.Socket('127.0.0.1',{'port':8124}); 
 socket.connect();
 socket.on('connect', function(){ console.log("conn"); }) 
 socket.on('message', function(x){ console.log("msg: "+x); }) 
 socket.on('disconnect', function(){ console.log("disc"); }) 
</script> 