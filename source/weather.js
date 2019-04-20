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
    //The zip pattern finds patterns such as:
    //95616 or 99750-0077
    //
    var cityState = new RegExp(/([\w\s]+,\s*\w{2})/);
    var zip = new RegExp(/[0-9]{5}(?:-[0-9]{4})?/)

    //console.log(zip.exec(inputFieldText));
    var matchZip = inputFieldText.match(zip);
    var matchCityState = inputFieldText.match(cityState);
    var location = null;
    if (matchZip != null) {
       var location =  matchZip[0];
    } else if (matchCityState != null){
        var location = matchCityState[0] + ',US';
    }
    if (location == null) {
        //TODO - Handle this in some way. This is if a user doesn't enter location
        console.log("Invalid location entered");
    } else {
        var url = 'http://api.openweathermap.org/data/2.5/forecast/hourly?q=' + location + '&units=imperial&APPID=78b2b473ac33f10c8b07fb26657b5bc5'
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

