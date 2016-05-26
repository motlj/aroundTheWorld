function initMap() {

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(userLocal, defaultLocal);
       
  } else {
    alert("Browser does not support geolocation.");
    //secondary default location
    var latitude = 43.0500;
    var longitude = -87.9500;
    mapGenerator(latitude, longitude);
    cityNameFinder(latitude, longitude);
  }

  function userLocal(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    mapGenerator(latitude, longitude);
    cityNameFinder(latitude, longitude);
  }

  function defaultLocal() {
    var latitude = 43.0500;
    var longitude = -87.9500;
    mapGenerator(latitude, longitude);
    cityNameFinder(latitude, longitude);
  }

  function mapGenerator(latitude, longitude) {
    var latitude = latitude;
    var longitude = longitude;
    console.log(latitude);
    console.log(longitude);
    var map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: latitude, lng: longitude},
      zoom: 13,
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
        map.setZoom(17);
        // Why 17? Because it looks good.
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
  }

  function cityNameFinder(latitude, longitude) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        currentWOEID(xhttp)
      }
    };
    xhttp.open("GET", "https://query.yahooapis.com/v1/public/yql?q=select%20woeid%20from%20geo.places%20where%20text%3D%22(" + latitude + "," + longitude + ")%22%20limit%201&diagnostics=false", true);
    xhttp.send();

    function currentWOEID(xml) {
      var xmlDoc = xml.responseXML;
      document.getElementById("whereInTheWorld").innerHTML = xmlDoc.getElementsByTagName("woeid")[0].childNodes[0].nodeValue;
      var woeid = xmlDoc.getElementsByTagName("woeid")[0].childNodes[0].nodeValue;
      //console.log(woeid);
      weather(woeid);
    }
  }

  function weather(woeid) {
    function request() {
      return $.ajax({
        type : 'GET',
        datatype : 'jsonp',
        cache : 'false',
        url : 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20('+woeid+')&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys',
        success : function (response) {
          $('#currentLocationWeather').append('<h3>Local Weather</h3><h3>' + response.query.results.channel.location.city + ', ' + response.query.results.channel.location.region + ', ' + response.query.results.channel.location.country + '</h3><h4>' + response.query.results.channel.item.condition.date + '</h4><h5>' + response.query.results.channel.item.condition.temp + '°F, ' + response.query.results.channel.item.condition.text + '</h5>');
            //console.log(response.query.results.channel.location.city);
            socket.emit
            tweets(response.query.results.channel.location.city);
        }
      });
    }
    $(document).ready(request);
  }

  var worldlyObj = {
    tweets : []
  };

  function tweets(city) {
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
          worldlyObj.tweets.push(status.text);
        });
      }
    });
    //$(document).ready(tweets);
  }
 
  $(document).ready(function(){
    tweets("milwaukee");
  });
}

/*  function twitter(city) {
    return $.ajax({
      type: 'GET',
      datatype: 'json',
      headers: {
        authorization: 'OAuth oauth_consumer_key="trR3lmHQz66Vqdehjxefp6ETk",oauth_token="734879068554825730-OjbgH0awp9fdaomwpIaaqUkG5fOeN10",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1464050055",oauth_nonce="kVzWWZ",oauth_version="1.0",oauth_signature="v5COC0rraDiTXypeUTvC%2BjlQ7rI%3D"'
      },
      url: 'https://api.twitter.com/1.1/search/tweets.json?q='+city,
      success : function (response) {
        console.log(response);
      }
    });
    $(document).ready(request);
  }*/

/*    var settings = {
      "async": true,
      "crossDomain": true,
      "datatype" : 'jsonp',
      "url": "https://api.twitter.com/1.1/search/tweets.json?q=%40"+city+"",
      "method": "GET",
      "headers": {
        "authorization": "OAuth oauth_consumer_key=\\\"trR3lmHQz66Vqdehjxefp6ETk\\\",oauth_token=\\\"734879068554825730-OjbgH0awp9fdaomwpIaaqUkG5fOeN10\\\",oauth_signature_method=\\\"HMAC-SHA1\\\",oauth_timestamp=\\\"1464047251\\\",oauth_nonce=\\\"HWbqvQ\\\",oauth_version=\\\"1.0\\\",oauth_signature=\\\"FOqyMPtkyDH5OVbszegTaD20mtw%3D\\\"",
        "cache-control": "no-cache",
        "postman-token": "d30ec0b4-34ab-516b-06d2-9da60f5ac7ac"
      }
    }

    $.ajax(settings).done(function (response) {
      console.log(response);
    });
  }
}*/
