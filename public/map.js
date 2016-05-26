//=================================================
//index on click functions						  |
//=================================================
$("#setLocation").on("click", function() {
	var location = $("#location").val();
	maps.currentLocation(location);
});

$("#setDestination").on("click", function() {
	var destination = $("#destination").val();
	findDestination(destination);
});

var maps = {
	currentLocation : function (location) {
		function request() {
			return $.ajax({
				type : 'GET',
				datatype : 'jsonp',
				cache : 'false',
				url : 'http://api.wunderground.com/api/f5a3baacd528711c/conditions/q/WI/'+location+'.json',
				success : function (response) {
					$.each(response.data, function(key, value) {
						$('currentLocationMap').append('<h3>' + value.current_observation.display_location.full + '</h3><h2>' + value.current_observation.temp_f + ' F, ' + value.current_observation.relative_humidity + '% Humidity, ' + value.current_observation.weather + ', Winds at ' + value.current_observation.wind_mph + ', ' + value.current_observation.wind_dir + '</h2><h1>' + value.current_observation.observation_time + '</h1>');
					});
				}
			});
		}
	},
	FindDestination : function (destination) {
		function request() {
			return $.ajax({
				type : 'GET',
				datatype : 'jsonp',
				cache : 'false',
				url : 'http://api.wunderground.com/api/f5a3baacd528711c/conditions/q/WI/'+destination+'.json',
				success : function (response) {
					$.each(response.data, function(key, value) {
						$('currentLocationMap').append('<h3>' + value.current_observation.display_location.full + '</h3><h2>' + value.current_observation.temp_f + ' F, ' + value.current_observation.relative_humidity + '% Humidity, ' + value.current_observation.weather + ', Winds at ' + value.current_observation.wind_mph + ', ' + value.current_observation.wind_dir + '</h2><h1>' + value.current_observation.observation_time + '</h1>');
					});
				}
			});
		}
	}
}

