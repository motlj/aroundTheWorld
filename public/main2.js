/*$(function() {
  var socket = io(); 

  socket.on('tweets', function(tweetsFound) {
    console.log(tweetsFound);
  });
});
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  // Initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box
  var $loginPage = $('.login.page'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page

  // Prompt for setting a username
  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();



  function addParticipantsMessage (data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "there's 1 participant";
    } else {
      message += "there are " + data.numUsers + " participants";
    }
    log(message);
  }

  // Sets the client's username
  function setUsername () {
    username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off('click');
      $currentInput = $inputMessage.focus();

      // Tell the server your username
      socket.emit('add user', username);
    }
  }

  // Sends a chat message
  function sendMessage () {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('');
      addChatMessage({
        username: username,
        message: message
      });
      // tell server to execute 'new message' and send along one parameter
      socket.emit('new message', message);
    }
  }

  // Log a message
  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  function addChatTyping (data) {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping (data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  // Updates the typing event
  function updateTyping () {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages (data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }

  // Gets the color of a username through our hash function
  function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  // Keyboard events

  $window.keydown(function (event) {
    if ($("input.inputMessage").is(":focus") || $("input.usernameInput").is(":focus")) {
    // Auto-focus the current input when a key is typed
      if (!(event.ctrlKey || event.metaKey || event.altKey)) {
        $currentInput.focus();
      }
      // When the client hits ENTER on their keyboard
      if (event.which === 13) {
        if (username) {
          sendMessage();
          socket.emit('stop typing');
          typing = false;
        } else {
          setUsername();
        }
      }
    }
  });

  $inputMessage.on('input', function() {
    updateTyping();
  });

  // Click events

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  // Socket events


  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {
    connected = true;
    // Display the welcome message
    var message = "Welcome to Socket.IO Chat – ";
    log(message, {
      prepend: true
    });
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
    addChatMessage(data);
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {
    log(data.username + ' joined');
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
    log(data.username + ' left');
    addParticipantsMessage(data);
    removeChatTyping(data);
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function (data) {
    addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {
    removeChatTyping(data);
  });
});*/


  //==========================//
  //=======API CALLS==========//

function initMap2() {
  var socket = io();

  //checks to see if location services are enabled
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(userLocal, defaultLocal);   
  } else {
    alert("Browser does not support geolocation.");
    //secondary default location
    var latitude = 43.8256;
    var longitude = 87.6168;
    mapGenerator(latitude, longitude);
    cityNameFinder(latitude, longitude);
  }
  //finds user location
  function userLocal(position) {
    var latitude = 43.8256;
    var longitude = 87.6168;
    //var longitude = longitude + 180;
    mapGenerator(latitude, longitude);
    cityNameFinder(latitude, longitude);
  }
  //sets default location of loaction services are off
  function defaultLocal() {
    var latitude = 43.8256;
    var longitude = 87.6168;
    mapGenerator(latitude, longitude);
    cityNameFinder(latitude, longitude);
    initMap2(latitude, longitude);
  }
  //generates map using location
  function mapGenerator(latitude, longitude) {
    var latitude = latitude;
    var longitude = longitude;
    console.log(latitude);
    console.log(longitude);
    var map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: latitude, lng: longitude},
      zoom: 7,
      mapTypeId: google.maps.MapTypeId.HYBRID,
      mapTypeControl: false, 
    });
    var input = /** @type {!HTMLInputElement} */(
        document.getElementById('pac-input'));

    var types = document.getElementById('type-selector');
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(types);

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    var infowindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
      map: map,
      anchorPoint: new google.maps.Point(0, -29)
    });

    autocomplete.addListener('place_changed', function() {
      infowindow.close();
      marker.setVisible(false);
      var place = autocomplete.getPlace();
      if (!place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
      }

      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(8);
      }
      marker.setIcon(/** @type {google.maps.Icon} */({
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(35, 35)
      }));
      marker.setPosition(place.geometry.location);
      marker.setVisible(true);
      var address = '';
      if (place.address_components) {
        address = [
          (place.address_components[0] && place.address_components[0].short_name || ''),
          (place.address_components[1] && place.address_components[1].short_name || ''),
          (place.address_components[2] && place.address_components[2].short_name || '')
        ].join(' ');
      }
      infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
      infowindow.open(map, marker);
    });
    //socket.emit('fetch trails', latitude, longitude);
  }

  //finds city name
  function cityNameFinder(latitude, longitude) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        currentWOEID(xhttp)
      }
    };
    xhttp.open("GET", "https://query.yahooapis.com/v1/public/yql?q=select%20woeid%20from%20geo.places%20where%20text%3D%22(" + latitude + "," + longitude + ")%22%20limit%201&diagnostics=false", true);
    xhttp.send();
    //uses name to find woeid
    function currentWOEID(xml) {
      var xmlDoc = xml.responseXML;
      document.getElementById("whereInTheWorld").innerHTML = xmlDoc.getElementsByTagName("woeid")[0].childNodes[0].nodeValue;
      var woeid = xmlDoc.getElementsByTagName("woeid")[0].childNodes[0].nodeValue;
      weather(woeid);
    }
  }
  //gets weather from yahoo
  function weather(woeid) {
    function request() {
      return $.ajax({
        type : 'GET',
        datatype : 'jsonp',
        cache : 'false',
        url : 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20('+woeid+')&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys',
        success : function (response) {
          $('#currentLocationWeather').append('<h3>' + response.query.results.channel.location.city + ', ' + response.query.results.channel.location.region + ', ' + response.query.results.channel.location.country + '</h3><h4>' + response.query.results.channel.item.condition.date + '</h4><h5>' + response.query.results.channel.item.condition.temp + '°F, ' + response.query.results.channel.item.condition.text + '</h5>');
            var city = response.query.results.channel.location.city;
            socket.emit('fetch tweets2', city);
            //localEvents(city);
            books(city);
            //songs(city);
        }
      });
    }
    $(document).ready(request);
  }

/*  function songs(city) {
    return $.ajax({
      type : 'GET',
      dataType : 'jsonp',
      cache : 'false',
      url : "https://itunes.apple.com/search?term="+city,
      success : function(response) {
        $('#songs').append('<div class="row"><div class="col-lg-6 col-md-6 col-sm-12 col-xs-12"><h3>' + response.results[0].trackName + ' by <em>' + response.results[0].artistName + '</em></h3><p><img src="' + response.results[0].artworkUrl100 + '"></p><p>Genre: ' + response.results[0].primaryGenreName + '</p></div><div class="col-lg-6 col-md-6 col-sm-12 col-xs-12"><h3>' + response.results[1].trackName + ' by <em>' + response.results[1].artistName + '</em></h3><p><img src="' + response.results[1].artworkUrl100 + '"></p><p>Genre: ' + response.results[1].primaryGenreName + '</p></div></div><div class="row"><div class="col-lg-6 col-md-6 col-sm-12 col-xs-12"><h3>' + response.results[2].trackName + ' by <em>' + response.results[2].artistName + '</em></h3><p><img src="' + response.results[2].artworkUrl100 + '"></p><p>Genre: ' + response.results[2].primaryGenreName + '</p></div><div class="col-lg-6 col-md-6 col-sm-12 col-xs-12"><h3>' + response.results[3].trackName + ' by <em>' + response.results[3].artistName + '</em></h3><p><img src="' + response.results[3].artworkUrl100 + '"></p><p>Genre: ' + response.results[3].primaryGenreName + '</p></div></div>');
      }
    });
  }*/

  function books(city) {  
    return $.ajax({
      type : 'GET',
      dataType : 'jsonp',
      cache : 'false',
      url : "https://www.googleapis.com/books/v1/volumes?q="+city,
      success : function(response) {
        $('#books').append('<div class="row"><div class="col-lg-6 col-md-6 col-sm-12 col-xs-12"><h3>' + response.items[0].volumeInfo.title + ' by <em>' + response.items[0].volumeInfo.authors + '</em></h3><p><img src="' + response.items[0].volumeInfo.imageLinks.smallThumbnail + '"></p></div><div class="col-lg-6 col-md-6 col-sm-12 col-xs-12"><h3>' + response.items[1].volumeInfo.title + ' by <em>' + response.items[1].volumeInfo.authors + '</em></h3><p><img src="' + response.items[1].volumeInfo.imageLinks.smallThumbnail + '"></p></div></div><div class="row"><div class="col-lg-6 col-md-6 col-sm-12 col-xs-12"><h3>' + response.items[2].volumeInfo.title + ' by <em>' + response.items[2].volumeInfo.authors + '</em></h3><p><img src="' + response.items[2].volumeInfo.imageLinks.smallThumbnail + '"></p></div><div class="col-lg-6 col-md-6 col-sm-12 col-xs-12"><h3>' + response.items[3].volumeInfo.title + ' by <em>' + response.items[3].volumeInfo.authors + '</em></h3><p><img src="' + response.items[3].volumeInfo.imageLinks.smallThumbnail + '"></p></div></div>');
      }
    });
  }
    
  //gets a list of events from ticketmaster
/*  function localEvents(city) {
    return $.ajax({
      type : 'GET',
      datatype : 'jsonp',
      cache : 'false',
      url : 'https://app.ticketmaster.com/discovery/v1/attractions.json?keyword='+city+'&apikey=M6ytr9tno9wiAbIITrgf39QD6Ih4LxeL',
      success : function (response) {
        $('#currentLocationEvents').append('<h4>' + response._embedded.attractions[0].name + '</h4><h5>Buy tickets now at <a target="_blank" href="http://www.ticketmaster.com' + response._embedded.attractions[0].url + ' ">Ticketmaster.com</a></h5><br><h4>' + response._embedded.attractions[1].name + '</h4><h5>Buy tickets now at <a target="_blank" href="http://www.ticketmaster.com' + response._embedded.attractions[1].url + ' ">Ticketmaster.com</a></h5><br><h4>' + response._embedded.attractions[2].name + '</h4><h5>Buy tickets now at <a target="_blank" href="http://www.ticketmaster.com' + response._embedded.attractions[2].url + ' ">Ticketmaster.com</a></h5><br>');
      }
    });
  }*/

  var socket = io();
      //gets 'trails' from server
  socket.on('trails found', function(trails) {
    $("#trails").append('<h4><strong>' + trails.places[0].name + '</strong> in ' + trails.places[0].city + '</h4><p>' + trails.places[0].activities[0].description + '</p><br><h4><strong>' + trails.places[1].name + '</strong> in ' + trails.places[1].city + '</h4><p>' + trails.places[1].activities[0].description + '</p><br><h4><strong>' + trails.places[2].name + '</strong> in ' + trails.places[2].city + '</h4><p>' + trails.places[2].activities[0].description + '</p>');
  });

  socket.on('tweets found', function(tweets) {
    var printTweets = tweets;
    $("#tweets").append('<h4>' + printTweets + '</h4><hr>');
  }); 
}