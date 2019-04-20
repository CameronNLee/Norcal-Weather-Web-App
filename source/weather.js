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
    //ZIP or CITY, ST, CC. Otherwise, if user types just CITY, ST, we can just match separately for that because of
    //OWM's weird issue

    if (zipOrCityStateCountryMatcher != null) {
        location =  zipOrCityStateCountryMatcher[0];
    } else {
        var cityStateMatcher = inputFieldText.match(cityState);
        if (cityStateMatcher != null) {
            location =  cityStateMatcher[0] + ',';
        } 
    }

    if (location == null) {
        //TODO - Handle this in some way. This is if a user doesn't enter location
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
      console.log(JSON.stringify(object, undefined, 2));  // print it out as a string, nicely formatted
  };

  xhr.onerror = function() {
    alert('Woops, there was an error making the request.');
  };

  // Actually send request to server
  xhr.send();
}

