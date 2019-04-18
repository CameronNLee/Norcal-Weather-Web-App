"strict mode";
//important
//Open weather api key : 78b2b473ac33f10c8b07fb26657b5bc5
//
function onSubmitClick(){
    //Take whatever's in 
    var inputFieldText = document.getElementById("locationInputField").value;

    //TODO parse inputFieldText and split up url. Where it says "Davis, CA" we will need to parse this out
    //and separate URL into http://api.openweathermap.org/data/2.5/forecast/hourly?q=PARSED VARIABLE,US&units=imperial&APPID=78b2b473ac33f10c8b07fb26657b5bc5");
    //API key might not work rn because it needs a couple hours to activate
    makeCorsRequest("http://api.openweathermap.org/data/2.5/forecast/hourly?q=Davis,CA,US&units=imperial&APPID=78b2b473ac33f10c8b07fb26657b5bc5");
}




// Do a CORS request to get Davis weather hourly forecast

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
      console.log(JSON.stringify(object, undefined, 2));  // print it out as a string, nicely formatted
  };

  xhr.onerror = function() {
    alert('Woops, there was an error making the request.');
  };

  // Actually send request to server
  xhr.send();
}

