// Setup basic express server
/*var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var http = require("https");

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});*/

// Routing
//app.use(express.static(__dirname + '/public'));

// Chatroom

/*var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
*/
/*  socket.on('fetch tweets', function (city) {
    return $.ajax({
      type: 'GET',
      datatype: 'jsonp',
      headers: {
        authorization: 'OAuth oauth_consumer_key="trR3lmHQz66Vqdehjxefp6ETk",oauth_token="734879068554825730-OjbgH0awp9fdaomwpIaaqUkG5fOeN10",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1464050055",oauth_nonce="kVzWWZ",oauth_version="1.0",oauth_signature="v5COC0rraDiTXypeUTvC%2BjlQ7rI%3D"'
      },
      url: 'https://api.twitter.com/1.1/search/tweets.json?q=' + city,
      success : function (response) {
        $.each(response.statuses, function(index, status){
          console.log(status.text);
          socket.emit('tweets', (status.text));
        });
      }
    });
    //$(document).ready(tweets);
  });


/*  socket.on('fetch tweets', function(city) {
    console.log(city);
    var d = new Date();
    var n = d.getTime();
    console.log(n);
    var options = {
      "method": "GET",
      "hostname": "api.twitter.com",
      "port": null,
      "path": "/1.1/search/tweets.json?q=milwaukee&oauth_consumer_key=trR3lmHQz66Vqdehjxefp6ETk&oauth_token=734879068554825730-OjbgH0awp9fdaomwpIaaqUkG5fOeN10&oauth_signature_method=HMAC-SHA1&oauth_timestamp=1464223473&oauth_nonce=KHi2Jf&oauth_version=1.0&oauth_signature=II1HwbKW%203ipokJLj0fWanrD0Sw%3D"
      "headers": {
        "cache-control": "no-cache",
        "postman-token": "ba0ac6c8-a4ea-a685-8544-5c21fcc2f518"
      }
    };

    var req = http.request(options, function (res) {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
        //console.log('make it to res.on');
      });

      res.on("end", function () {
        //console.log('made it to seconds res.on');
        var tweets = JSON.parse(Buffer.concat(chunks).toString()); //json
        console.log(tweets);
        socket.emit('tweets', tweets);

        //console.log(tweets.statuses[0].text);
      });
    });
    req.end();
  });*/

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var http = require("https");


server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

io.on('connection', function (socket) {
  //============trails===========//
  socket.on('fetch trails', function(latitude, longitude) {
    console.log("trails");
    var options = {
      "method": "GET",
      "hostname": "trailapi-trailapi.p.mashape.com",
      "port": null,
      "path": "/?lat=" + latitude + "&limit=5&lon="+ longitude +"&radius=25",
      "headers": {
        "x-mashape-key": "U6MqNQDxurmshcrWFNWZFbyhhuW5p1QfYBAjsnAOQWXNGqpDoY",
        "cache-control": "no-cache",
        "postman-token": "0aafab45-7d92-4e0e-a5c8-bb3c12d730d5"
      }
    };
    var req = http.request(options, function (res) {
      var chunks = [];
      res.on("data", function (chunk) {
        chunks.push(chunk);
      });
      res.on("end", function () {
        var trails = JSON.parse(Buffer.concat(chunks).toString());
        console.log(trails);
        socket.emit('trails found', trails);
        //var body = Buffer.concat(chunks);
        //console.log(body.toString());
      });
    });
    req.end();
  });

  //============twitter===========//
  socket.on('fetch tweets', function(city) {
    var Twitter = require("twitter");
    console.log(city);
    console.log("made it to socket");
    var client = new Twitter({
      consumer_key: 'trR3lmHQz66Vqdehjxefp6ETk',
      consumer_secret: 'uOotFztpkK18NcHerbaQokLfDTP1KienfmUlNkQ7KNzgZCdwGa',
      access_token_key: '734879068554825730-OjbgH0awp9fdaomwpIaaqUkG5fOeN10',
      access_token_secret: 'uKYAhOT1TLS3ZVSa09K7DdJF2XOiXfX9DDwo2etyqst25'
    });

    var stream = client.stream('statuses/filter', {track: 'milwaukee'});
    stream.on('data', function(tweet) {
      var tweets = tweet
      console.log(tweet.text);
      socket.emit('tweets found', tweet.text);
      //document.getElementById('tweets').innerHTML = tweets;
    });
    
    stream.on('error', function(error) {
      throw error;
    });
  });
  socket.on('fetch tweets2', function(city) {
    var Twitter = require("twitter");
    console.log(city);
    console.log("made it to socket");
    var client = new Twitter({
      consumer_key: 'trR3lmHQz66Vqdehjxefp6ETk',
      consumer_secret: 'uOotFztpkK18NcHerbaQokLfDTP1KienfmUlNkQ7KNzgZCdwGa',
      access_token_key: '734879068554825730-OjbgH0awp9fdaomwpIaaqUkG5fOeN10',
      access_token_secret: 'uKYAhOT1TLS3ZVSa09K7DdJF2XOiXfX9DDwo2etyqst25'
    });

    var stream = client.stream('statuses/filter', {track: 'China'});
    stream.on('data', function(tweet) {
      var tweets = tweet
      console.log(tweet.text);
      socket.emit('tweets found', tweet.text);
      //document.getElementById('tweets').innerHTML = tweets;
    });
    
    stream.on('error', function(error) {
      throw error;
    });
  });
});

