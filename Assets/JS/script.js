// variable declaration
var city = "";
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


// search cityHistory for existing city input
function find(c) {
    for (var i=0; i<cityHistory.length; i++) {
        if(c.toUpperCase() === cityHistory[i]) {
            return -1;
        }
    }
    return 1;
}

// Display Weather from input Element
function displayWeather(event) {

    // Prevents page from reloading upon form submission
    event.preventDefault();
    
    // If input are not "" then fetch currentWeather(input Location)
    if (searchCity.val().trim() !=="") {
        city = searchCity.val().trim();
        currentWeather(city);
    }
    else {
        alert("Please enter a City Name");
    };
};

// Fetch Current Weather
function currentWeather(city) {

    // API request var
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(function(response){
        console.log(response);

            // Icon request thru API
            var iconWeather = response.weather[0].icon;
            var iconUrl = "https://openweathermap.org/img/wn/"+ iconWeather +"@2x.png";

            // Date via JS
            var date = new Date (response.dt*1000).toLocaleDateString();

            // Add City | Date | Icon to HTML
            $(selectedCity).html(response.name + " (" + date + ") " + "<img src=" + iconUrl + ">" );

            // Tempurature and display info to HTML
            var currentTempF = (response.main.temp - 273.15) * 1.80 + 32;
            $(currentTemp).html((currentTempF).toFixed(2)+" &#8457");

            // Wind Speed (to MPH) and display info to HTML
            var windspeed = (response.wind.speed);
            var speedToMph = (windspeed*2.237).toFixed(1);
            $(currentWind).html(speedToMph + " MPH");

            // Humidity and display info to HTML
            var humidPercent = (response.main.humidity);
            $(currentHumid).html(humidPercent + " %");

            // UV Index
            indexUV(response.coord.lon, response.coord.lat);

            forecast(response.id);

            // input form response validation
            if (response.cod==200) {
                cityHistory = JSON.parse(localStorage.getItem("inputCity"));
                console.log(cityHistory);
                if (cityHistory == null){
                    cityHistory = [];
                    cityHistory.push(city.toUpperCase()
                    );
                    localStorage.setItem("inputCity",JSON.stringify(cityHistory));
                    addToList(city);
                }
                else {
                    if (find(city)>0){
                        cityHistory.push(city.toUpperCase());
                        localStorage.setItem("inputCity",JSON.stringify(cityHistory));
                        addToList(city);
                    }
                }
            }

    });
};

// Gathers UV Index Data and display
function indexUV(lon, lat) {
    var uvUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey;
    $.ajax({
            url: uvUrl,
            method:"GET"
    }).then(function(response){
        console.log(response);
        var checkUv = parseInt(response.current.uvi);
        $(currentUv).html(response.current.uvi);
            // adds background color for index value
            if (checkUv < 2) {
                $(currentUv).attr("class", "bg-success rounded py-2 px-2 text-white");
            }
            else if (checkUv > 3 && checkUv < 5) {
                $(currentUv).attr("class", "bg-warning rounded py-2 px-2 text-white");
            }
            else if (checkUv > 6 && checkUv < 7) {
                $(currentUv).attr("class", "rounded py-2 px-2 text-white");
                $(currentUv).css("background-color", "#FF6600");
            }
            else if (checkUv > 8 && checkUv < 10) {
                $(currentUv).attr("class", "bg-danger rounded py-2 px-2 text-white");
            }
            else if (checkUv > 11) {
                $(currentUv).attr("class", "rounded py-2 px-2 text-white");
                $(currentUv).css("background-color", "#9370DB");
            };
    });
};

// 5 day Future Forecast for selected City
function forecast(cityid) {
    var dayover = false;
    var queryForCastUrl = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityid + "&appid=" + APIKey;
    $.ajax({
        url: queryForCastUrl,
        method: "GET"
    }).then(function(response) {

        // For loop for next 5 days
        for (i=0; i<5; i++) {
            var date = new Date((response.list[((i+1) *8) -1].dt)*1000).toLocaleDateString();
            var iconWeather = response.list[((i+1) *8) -1].weather[0].icon;
            var iconUrl = "https://openweathermap.org/img/wn/" + iconWeather + ".png";
            var tempKelvin = response.list[((i+1) *8) -1].main.temp;
            var tempFConvert = (((tempKelvin - 273.5) *1.80) +32).toFixed(2);
            var wind = response.list[((i+1) *8) -1].wind.speed
            var windMPH = (wind * 2.237).toFixed(1);
            var humidity = response.list[((i+1) *8) -1].main.humidity;

            // Display in proper futurefore-cast section
            $("#future-date-"+i).html(date);
            $("#future-icon-" +i).html("<img src=" + iconUrl + ">");
            $("#future-temp-" +i).html(tempFConvert + " &#8457");
            $("#future-wind-" +i).html(windMPH + " MPH");
            $("#future-humidity-" +i).html(humidity + " %");
        };
    });
};

// add passed City to Search History
function addToList(c) {
    var listEl = $("<li>"+c.toUpperCase()+"</li>");
    $(listEl).attr("class", "search-history-item");
    $(listEl).attr("data-value", c.toUpperCase());
    $(".search-history").append(listEl);
};

// redisplay past search history
function searchHistory (event) {
    var listEl = event.target;
    if (event.target.matches("li")) {
        city = listEl.textContent.trim();
        currentWeather(city);
    };
};

// Load previously searched City Data
function loadPreviousCity() {
    $("ul").empty();
    var cityHistory = JSON.parse(localStorage.getItem("inputCity"));
    if (cityHistory !== null) {
        cityHistory = JSON.parse(localStorage.getItem("inputCity"));
        for (i=0; i < cityHistory.length; i++) {
            addToList(cityHistory[i]);
        }

        city = cityHistory[i-1];
        currentWeather(city);
    };
};

// Clear Button Functionality
function clearHistory(event) {
    event.preventDefault(event);
    cityHistory = [];
    localStorage.removeItem("inputCity");
    document.location.reload();
};

// UI Clickable

$(searchButton).on("click", displayWeather);
$(document).on("click", searchHistory);
$(window).on("load", loadPreviousCity);
$(clearButton).on("click", clearHistory);