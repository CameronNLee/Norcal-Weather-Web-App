"strict mode";
//Open weather api key : 78b2b473ac33f10c8b07fb26657b5bc5

function onSubmitClick(){
    //Take whatever's in the textfield
    var inputFieldText = document.getElementById("locationInputField").value;

    //Regex sources: https://stackoverflow.com/questions/9686395/regular-expression-for-validating-city-state-zip
    //               https://www.oreilly.com/library/view/regular-expressions-cookbook/9781449327453/ch04s14.html
    //
    //The cityState pattern finds patterns such as:
    //Davis, CA or Davis,CA
    //The zipOrCityStateCountry pattern finds patterns such as:
    //95616 or 99750-0077 for zip, or
    //Davis, CA, US for CityStateCountry
    //this is because for some reason OWM returns "no city found" for "Davis, CA" but
    //it has no problem with "Davis, CA," (comma at the end) 

    var location = null;
    var zipOrCityOrCityStateCountry = new RegExp (/[\w\s]+|[0-9]{5}(?:-[0-9]{4})?|([\w\s]+,\s*\w{2},\s*\w{2})/);
    var cityState = new RegExp(/([\w\s]+,\s*\w{2})/);
    var zipOrCityStateCountryMatcher = inputFieldText.match(zipOrCityOrCityStateCountry);

    //Reason I do this nested loop is because there's no need to match twice. We just have to hope a user types in
    //ZIP or CITY, ST, CC or CITY. Otherwise, if user types just CITY, ST, we can just match separately for that because of
    //OWM's weird issue with commas needing to be at the end of "CITY, ST"

    if (zipOrCityStateCountryMatcher != null) {
        location =  zipOrCityStateCountryMatcher[0];
    } else {
        var cityStateMatcher = inputFieldText.match(cityState);
        if (cityStateMatcher != null) {
            location =  cityStateMatcher[0] + ',';
        } 
    }

    if (location == null) {
        //TODO - Handle this in some way. This is if a user doesn't enter location in one of the formats above
        console.log("Invalid location entered");
    } else {
        var url = `http://api.openweathermap.org/data/2.5/forecast/hourly?q=${location}&units=imperial&APPID=78b2b473ac33f10c8b07fb26657b5bc5`
        makeCorsRequest(url);
    }   
}

// Create the XHR object.
function createCORSRequest(method, url) {
  let xhr = new XMLHttpRequest();
  xhr.open(method, url, true);  // call its open method
  return xhr;
}

// Make the actual CORS request.
function makeCorsRequest(url) {
  let xhr = createCORSRequest('GET', url);

  // checking if browser does CORS
  if (!xhr) {
    alert('CORS not supported');
    return;
  }

  // Load some functions into response handlers.
  xhr.onload = function() {
      let responseStr = xhr.responseText;  // get the JSON string 
      let object = JSON.parse(responseStr);  // turn it into an object
      /*This is where we will handle the response*/
      let sacLat = 38.5816;
      let sacLon = -121.478851;
      if (object["cod"] != "404") {
      let desiredLocationLat = object["city"]["coord"]["lat"];
      let desireLocationLon = object["city"]["coord"]["lon"];
      //distance function checks if distance is less than or equals to 150 miles from Sacramento (our default location)
      if (distance(sacLat, sacLon,desiredLocationLat,desireLocationLon, "M")) {
        console.log(JSON.stringify(object, undefined, 2));  // print it out as a string, nicely formatted
      } else { //distance is > 150 miles
        //TODO - Handle this in some way. This is if a user doesn't enter location within 150 miles
        console.log("Invalid location entered");
      }

    } else { //if for some reason we end up with a code 404 from the API
        //TODO - Handle this in some way (Maybe let user know they entered an invalid location?)
    }
     
  };

  xhr.onerror = function() {
    alert('Woops, there was an error making the request.');
  };

  // Actually send request to server
  xhr.send();
}

//MODIFIED A BIT -- Returns bool (dist <= 150) instead of the original distance
//Below is the source!
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::                                                                         :::
//:::  This routine calculates the distance between two points (given the     :::
//:::  latitude/longitude of those points). It is being used to calculate     :::
//:::  the distance between two locations using GeoDataSource (TM) prodducts  :::
//:::                                                                         :::
//:::  Definitions:                                                           :::
//:::    South latitudes are negative, east longitudes are positive           :::
//:::                                                                         :::
//:::  Passed to function:                                                    :::
//:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
//:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
//:::    unit = the unit you desire for results                               :::
//:::           where: 'M' is statute miles (default)                         :::
//:::                  'K' is kilometers                                      :::
//:::                  'N' is nautical miles                                  :::
//:::                                                                         :::
//:::  Worldwide cities and other features databases with latitude longitude  :::
//:::  are available at https://www.geodatasource.com                         :::
//:::                                                                         :::
//:::  For enquiries, please contact sales@geodatasource.com                  :::
//:::                                                                         :::
//:::  Official Web site: https://www.geodatasource.com                       :::
//:::                                                                         :::
//:::               GeoDataSource.com (C) All Rights Reserved 2018            :::
//:::                                                                         :::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

function distance(lat1, lon1, lat2, lon2, unit) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist <= 150;
	}
}