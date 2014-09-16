var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var Twit = require('twit')
var config = require('./config');

var T = new Twit(config);

function parseTweet (aTweet){
	var obj = {};
	if (aTweet){
		obj.text = aTweet.text;
		obj.createdAt = aTweet.created_at;
		obj.user = aTweet.user.screen_name;
	}
	return obj;
}
app.use(express.static(__dirname + '/app'));
server.listen(port);

server.listen(port, function(){
  console.log('listening on ' + port);
});


io.on('connection', function (socket) {
  socket.on('search-stream', function (data) {
    console.log('request: ' + data);
    var stream = T.stream('statuses/filter', { track: [data] });
		stream.on('tweet', function (tweet) {
			socket.emit('search-stream-response', parseTweet(tweet));
		});
    stream.on('error', function(err){
      console.log('ERROR');
      console.log(err);
      var errMesg = 'Unknown error'
      if (err){
        if(err.toString().indexOf('Exceeded connection') >0){
          errMesg = 'Exceeded connection limit for user'
        }
      }
      socket.emit('tweet-error', {msg: errMesg});
      if (stream){
        stream.stop();
      }
    });
		socket.on('stop-stream', function(){
			console.log('stop stream!');
			if (stream){
        stream.stop();
      }
		});
    socket.on('disconnect', function() {
      if(stream){
        stream.stop();
      }
      console.log('disconnected ... stopped stream');
    });

  });
});


