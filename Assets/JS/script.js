// variable declaration
var location = "";
var searchCity = $("#city-input");
var searchButton = $("#search-btn");
var clearButton = $("#clear-btn");
var selectedCity = $("#selected-city");
var currentTemp = $("#temperature");
var currentWind = $("#wind");
var currentHumid = $("#humidity");
var currentUv = $("#uv");

// API Key
var APIKey = "b0febebb4847e59a642add06c013d2fe";

// API ONE CALL EXAMPLE
// https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}
// API GEOCODING EXAMPLE
// http://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid={API key}

// Search History Array Declaration
var cityHistory = [];

// Display Weather from input Element
function displayWeather(event) {

    // Prevents page from reloading upon form submission
    event.preventDefault();
    
    // If input are not "" then fetch currentWeather(input Location)
    if (searchCity.val().trim() !=="") {
        location = searchCity.val().trim();
        currentWeather(location);
    }
    else {
        alert("Please enter a City Name");
    };
};

// Fetch Current Weather
function currentWeather(location) {

    // API request var
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + location + "&APPID=" + APIKey;
    $.ajax({
        url: queryURL,
        method: "GET",
    });
        then(function(response){

            // Icon request thru API
            var iconWeather = response.weather[0].icon;
            var iconUrl = "https://openweathermap.org/img/wn/"+ iconWeather +"@2x.png";

            // Date via JS
            var date = new Date (response.dt*1000).toLocaleDateString();

            // Add City | Date | Icon to HTML
            $(selectedCity).html(response.name + "(" + date + ")" + "<img src=" + iconUrl + ">" );

            // Tempurature and display info to HTML
            var currentTempF = (response.main.temp - 273.15) * 1.80 + 32;
            $(currentTemp).html((currentTempF).tofixed(2)+"&#8457");

            // Humidity and display info to HTML
            var humidPercent = (response.main.humidity);
            $(currentHumid).html(humidPercent + "%");

            // Wind Speed (to MPH) and display info to HTML
            var windspeed = (response.main.speed);
            var speedToMph = (windspeed * 2.237).toFixed(1);
            $(currentWind).html(speedToMph + "MPH");

            // UV Index
            indexUV(response.coord.lon, response.coord.lat);

            // input form response validation
            if (response.cod==200) {
                cityHistory = JSON.parse(localStorage.getItem("cityname"));
                console.log(cityHistory);
                if (cityHistory==null){
                    cityHistory=[];
                    cityHistory.push(location.toUpperCase()
                    );
                    localStorage.setItem("cityname",JSON.stringify(cityHistory));
                    addToList(city);
                }
                else {
                    if(find(city)>0){
                        sCity.push(city.toUpperCase());
                        localStorage.setItem("cityname",JSON.stringify(sCity));
                        addToList(city);
                    }
                }
            }
    });
};

function indexUV(ln, lt) {
    var uvUrl = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + lt + "&lon=" + ln;
    $.ajax({
            url: uvUrl,
            method:"GET"
    });
        then(function(response){
            $(currentUvindex).html(response.value);
    });
};

// Clear Button Functionality

// UI Clickable