"use strict";
//Open weather api key : 78b2b473ac33f10c8b07fb26657b5bc5

let imageArray = [];  // global variable to hold stack of images for animation
let count = 0;       // global var
let dopplerCount = 0;
getTenImages();
animateDoppler ();

let url = "query?location=Davis,CA,US";
makeAjaxRequest(url);

function dopplerCountFunction () {
	dopplerCount+=1;
	if (dopplerCount == 10) dopplerCount = 0;
	return dopplerCount;
}

function animateDoppler () {
	setInterval( function() {
        document.getElementById("doppler-dax").src = imageArray[dopplerCountFunction()].src;
        //console.log(document.getElementById("doppler-dax").src);
	}, 180);
}

function onSubmitClick(){
    //Take whatever's in the textfield
    let inputFieldText = document.getElementById("locationInputField").value;

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

    let location = null;
    let zipOrCityStateCountry = new RegExp (/[0-9]{5}(?:-[0-9]{4})?|([\w\s]+,\s*\w{2},\s*\w{2})/ig);
    let cityState = new RegExp(/([\w\s]+,\s*\w{2})/);
    let city = new RegExp(/\b^(\w*[\w\s]\w*)\b/ig);
    let sanJose = new RegExp(/\b^(\w*San Jose\w*)\b/ig);
    let matcher = inputFieldText.match(sanJose);
    if (matcher != null) {
        location = "94088";
    } else {
        matcher = inputFieldText.match(city);
        if (matcher != null) {
            matcher = inputFieldText.match(city);
            location =  matcher[0] + ',US';
        } else {
             matcher = inputFieldText.match(zipOrCityStateCountry);
            //Reason I do this nested loop is because there's no need to match twice. We just have to hope a user types in
            //ZIP or CITY, ST, CC or CITY. Otherwise, if user types just CITY, ST, we can just match separately for that because of
            //OWM's weird issue with commas needing to be at the end of "CITY, ST"
            if (matcher != null) {
                location =  matcher[0];
            } else {
                matcher = inputFieldText.match(cityState);
                if (matcher != null) {
                    location =  matcher[0] + ',';
                } 
            }
        }    
    }

    if (location == null) {
        document.getElementById("locationInputField").value = "Invalid location";
        console.log("Invalid location entered");
    } else {
        let url = `query?location=${location}`;
        makeAjaxRequest(url);
    }   
}

// Create the XHR object.
function createAjaxRequest(method, url) {
  let xhr = new XMLHttpRequest();
  xhr.open(method, url, true);  // call its open method
  return xhr;
}

// Make the actual CORS request.
function makeAjaxRequest(url) {
  let xhr = createAjaxRequest('GET', url);

  // checking if browser does CORS
  if (!xhr) {
    alert('Ajax not supported');
    return;
  }

  // Load some functions into response handlers.
  xhr.onload = function() {
      console.log("Entered AJAX response handler.");
      let responseStr = xhr.responseText;  // get the JSON string 
      let object = JSON.parse(responseStr);  // turn it into an object
      console.log(object);
      /*This is where we will handle the response*/
      let davisLat = 38.5449;
      let davisLon = -121.740517;
      if (object["cod"] != "404") {
        let desiredLocationLat = object["city"]["coord"]["lat"];
        let desireLocationLon = object["city"]["coord"]["lon"];
        //distance function checks if distance is less than or equals to 150 miles from Sacramento (our default location)
        if (distance(davisLat, davisLon,desiredLocationLat,desireLocationLon, 'M')) {
            modifyScreen(object["list"]);
        } else { //distance is > 150 miles
            document.getElementById("locationInputField").value = "Invalid location";
            console.log("Invalid location entered");
        }
    } else { //if for some reason we end up with a code 404 from the API
        document.getElementById("locationInputField").value = "Invalid location";
    }
  };

  xhr.onerror = function() {
    alert('Error: could not make the request.');
  };

  // Actually send request to server
  xhr.send();
}

let weatherCodeMap = {"clear sky day": "../assets/clearsky.svg"
                    ,"clear sky night": "../assets/clear-night.svg"
                    ,"broken clouds": "../assets/brokencloud.svg"
                    ,"overcast clouds":"../assets/brokencloud.svg"
                    ,"broken clouds: 51-84%": "../assets/brokencloud.svg"
                    ,"overcast clouds: 85-100%":"../assets/brokencloud.svg"
                    ,"scattered clouds": "../assets/scatteredclouds.svg"
                    ,"scattered clouds: 25-50%" :  "../assets/scatteredclouds.svg"
                    ,"few clouds day": "../assets/fewclouds-day.svg"
                    ,"few clouds night": "../assets/fewclouds-night.svg"
                    ,"few clouds: 11-25% day" : "../assets/fewclouds-day.svg"
                    ,"few clouds: 11-25% night" : "../assets/fewclouds-day.svg"
                    ,"mist": "../assets/mist.svg" 
                    ,"rain day": "../assets/rain-day.svg"
                    ,"moderate rain day": "../assets/rain-day.svg"
                    ,"moderate rain night": "../assets/rain-night.svg"
                    ,"rain night": "../assets/rain-night.svg"
                    ,"heavy intensity rain": "../assets/showerrain.svg"
                    ,"light rain day": "../assets/rain-day.svg"
                    ,"light rain night": "../assets/rain-night.svg" 
                    ,"snow": "../assets/snow.svg"
                    ,"thunderstorm": "../assets/thunderstorms.svg"};



const dayTimes = new Set(["6 AM","7 AM","8 AM","9 AM","10 AM", "11 AM"
                         ,"12 PM","1 PM","2 PM","3 PM","4 PM","5 PM", "6 PM"]);

const nightTimes = new Set(["7 PM","8 PM","9 PM","10 PM","11 PM","12 AM"
                         ,"1 AM","2 AM","3 AM","4 AM","5 AM"]);

function modifyScreen(listOfTimestamps){
    for (let i = 0; i < 6; i++) { //The api gives us a list of 96 hours. We just want the first 6
        let time = document.getElementById(`time-${i}`);
        //Source: https://stackoverflow.com/questions/4631928/convert-utc-epoch-to-local-date
        let utcSeconds = listOfTimestamps[i]["dt"];
        let d = new Date(0);
        d.setUTCSeconds(utcSeconds);
        //Source: https://stackoverflow.com/questions/8888491/how-do-you-display-javascript-datetime-in-12-hour-am-pm-format
        if (i > 0) { //we are past the first screen
            time.textContent = d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        } else {
            time.textContent = d.toLocaleString('en-US', { hour: 'numeric',  hour12: true });
        }

        let image = document.getElementById(`image-${i}`);
        let imageCode = listOfTimestamps[i]["weather"][0]["description"];
        let timeCheck = d.toLocaleString('en-US', { hour: 'numeric',  hour12: true });

        if (imageCode == "clear sky" || imageCode == "few clouds" ||
            imageCode == "rain" || imageCode == "light rain" || imageCode == "moderate rain" ||
            imageCode == "few clouds: 11-25%") {
            if (dayTimes.has(timeCheck)) {
                imageCode = imageCode + " day";
            } else if (nightTimes.has(timeCheck)) {
                imageCode = imageCode + " night";
            }
        }
        image.src = weatherCodeMap[imageCode];
        
        let temp = document.getElementById(`temp-${i}`);
        temp.textContent = Math.round(listOfTimestamps[i]["main"]["temp"])+'°';
    }
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
		let radlat1 = Math.PI * lat1/180;
		let radlat2 = Math.PI * lat2/180;
		let theta = lon1-lon2;
		let radtheta = Math.PI * theta/180;
		let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
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

// This function controls the swiping up animation for mobile-view
function onUpArrowClick() {
    let topHalf = document.getElementById("topHalf");
    let bottomHalf = document.getElementById("bottomHalf");

    // Here, we add the two classes so that the CSS animation plays for both
    if (topHalf.classList.contains("top-half-transform-reverse")) {
        topHalf.classList.remove("top-half-transform-reverse");
        bottomHalf.classList.remove("bottom-half-transform-reverse");
    }
    topHalf.classList.add("top-half-transform");
    bottomHalf.classList.add("bottom-half-transform");
    topHalf.classList.remove("top-half");
    bottomHalf.classList.remove("bottom-half");
}

// This function controls the swiping down animation for mobile-view
function onDownArrowClick() {
    let topHalf = document.getElementById("topHalf");
    let bottomHalf = document.getElementById("bottomHalf");

    // Here, we add the two classes so that the CSS animation plays for both
    topHalf.classList.add("top-half-transform-reverse");
    bottomHalf.classList.add("bottom-half-transform-reverse");
    
    topHalf.classList.remove("top-half-transform");
    bottomHalf.classList.remove("bottom-half-transform");
}

let eventBottomHalf = document.getElementById("bottomHalf");
let nonMobile = window.matchMedia("(min-width: 481px)"); // in case viewport is resized
eventBottomHalf.addEventListener("animationend", animationListener, false);
nonMobile.addListener(viewChangeListener);

function animationListener() {
    if (this.classList.contains("bottom-half-transform-reverse")) {
        this.classList.remove("bottom-half-transform-reverse");
        this.classList.add("bottom-half");
    }
    
}

// Reset tophalf and bottomhalf to use default top-half and bottom-half classes
// upon viewport switch to either tablet or web view.
// This ensures that both non-mobile views are kept when interacting with
// the css swipe animations in mobile-view.
function viewChangeListener() {
    if (this.matches) {
        let topHalf = document.getElementById("topHalf");
        let bottomHalf = document.getElementById("bottomHalf");
        if (topHalf.classList.contains("top-half-transform-reverse")) {
            topHalf.classList.remove("top-half-transform-reverse");
            topHalf.classList.add("top-half");
            bottomHalf.classList.remove("bottom-half-transform-reverse");
            bottomHalf.classList.add("bottom-half");
        }
        else if (topHalf.classList.contains("top-half-transform")) {
            topHalf.classList.remove("top-half-transform");
            topHalf.classList.add("top-half");
            bottomHalf.classList.remove("bottom-half-transform");
            bottomHalf.classList.add("bottom-half");
        }
    }
}

/*Doppler stuff below here -- this is professor's code*/

function addToArray(newImage) {
	if (count < 10) {
		newImage.id = "doppler_"+count;
		newImage.style.display = "none";
		imageArray.push(newImage);
		count = count+1;
		if (count >= 10) {
			console.log("Got 10 doppler images");
		}
	}
}

function tryToGetImage(dateObj) {
	let dateStr = dateObj.getUTCFullYear();
	dateStr += String(dateObj.getUTCMonth() + 1).padStart(2, '0'); //January is 0!
	dateStr += String(dateObj.getUTCDate()).padStart(2, '0');

	let timeStr = String(dateObj.getUTCHours()).padStart(2,'0');
	timeStr += String(dateObj.getUTCMinutes()).padStart(2,'0');

	let filename = "DAX_"+dateStr+"_"+timeStr+"_N0R.gif";
	let newImage = new Image();
	newImage.onload = function () {
		// console.log("got image "+filename);
		addToArray(newImage);
	};
	newImage.onerror = function() {
		// console.log("failed to load "+filename);
	};
	newImage.src = "https://radar.weather.gov/ridge/RadarImg/N0R/DAX/"+filename;
}


function getTenImages() {
	let dateObj = new Date();  // defaults to current date and time
	// if we try 150 images, and get one out of every 10, we should get enough
	for (let i = 0; i < 150; i++) {
        tryToGetImage(dateObj);
  
		dateObj.setMinutes( dateObj.getMinutes()-1 ); // back in time one minute
	}

}

