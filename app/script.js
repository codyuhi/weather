/**
 * This code executes when the submit button is clicked in the weather form
 */
document.getElementById('weatherSubmit').addEventListener('click', async (event) => {
    event.preventDefault();
    // Clear out any existing error text and show a loading indicator while waiting for the promise to fulfill
    document.getElementById('errorText').innerText = '';
    document.getElementById('errorResults').style.display = 'none';
    document.getElementById('loadingIndicator').style.display = 'flex';

    // Obtain the user-provided city name
    const value = document.getElementById('weatherInput').value;

    // Enter API Key here from https://home.openweathermap.org/api_keys
    const apiKey = 'e2b4bc4f72162d183fbf9151e3f1f4a5';

    // If the form is blank, don't do anything except display an error
    if (value === '') {
        document.getElementById('loadingIndicator').style.display = 'none';
        document.getElementById('errorText').innerText = 'Please enter a US city to receive results';
        document.getElementById('errorResults').style.display = 'flex';
        return;
    }

    // Within the async function, perform async functions to display current conditions & forecast
    try {
        await displayCurrentConditions(value, apiKey);
        await displayForecast(value, apiKey);
    } catch {
        // If anything went wrong, hide the loading indicator
        document.getElementById('loadingIndicator').style.display = 'none';
    }
});

/**
 * This function performs the API call to get current conditions and display data on the screen
 * @param {string} value 
 * @param {string} apiKey 
 */
function displayCurrentConditions(value, apiKey) {

    // Use the API's URL and pass the user-provided city name. Also pass the API key as a param (poor security, not even using https)
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${value},US&units=imperial&APPID=${apiKey}`;
    fetch(url)
        .then((response) => {
            // promise resolved forwards the API response in json form
            return response.json();
        })
        .then((json) => {
            // If the success was not successful, throw error
            if (json.cod !== 200) {
                throw `Unable to get data for '${value}':\n${json.message}`;
            }

            // initialize results string which will hold the full string to be given in weatherResults div  
            let results = '';
            results += `<h2 id="cityName">Weather in ${json.name}:</h2>\n`;
            results += `<h3><span id="currentTemp">${json.main.temp}</span> &deg;F</h3>\n`;
            results += '<div id="currentColumnContainer">\n<div id="currentColumn1">\n';

            // Get the weather description icon and text
            results += '<div id="weatherDescription">\n';

            // For every entry in the weather array, get the icon and add to results
            json.weather.forEach((weather) => {
                results += `<img class="iconImg" src='http://openweathermap.org/img/w/${weather.icon}.png'/>\n`;
            });
            results += '<p class="currentText"> (';

            // For every entry in the weather array, get the description text and add to results
            for (let i = 0; i < json.weather.length; i++) {
                let description = json.weather[i].description;
                let firstLetter = description[0] || string.charAt(0);

                // Capitalize the first letter in description
                results += firstLetter.toUpperCase() + description.substring(1);
                if (i !== json.weather.length - 1) {
                    results += ', ';
                }
            }
            results += ')</p>\n</div>\n';
            results += `<p class="currentText">High: <span id="high">${json.main.temp_min}</span> &deg;F / Low: <span id="low">${json.main.temp_max}</span> &deg;F</p>\n`;
            results += `<p class="currentText">Lat: <span id="latitude">${json.coord.lat}</span> / Long: <span id="longitude">${json.coord.lon}</span></p>\n`;
            results += '</div><div id="currentColumn2">\n';
            results += `<p class="currentText">Wind Speed: <span id="windspeed">${json.wind.speed}</span> mph</p>\n`;
            results += `<p class="currentText">Humidity: <span id="humidity">${json.main.humidity}</span>%</p>\n`;
            results += `<p class="currentText">Atmospheric Pressure: <span id="pressure">${json.main.pressure}</span> hPa</p>\n`;
            results += '</div>\n</div>';

            // Render the weatherResults data
            document.getElementById('weatherResults').innerHTML = results;

            // Reveal the previously hidden div
            document.getElementById('currentWeatherContainer').style.display = 'flex';

            // Scroll down to the weatherResults div with a smooth scroll animation
            document.getElementById('weatherResults').scrollIntoView({ behavior: 'smooth' });
        })
        .catch((err) => {
            // If anything went wrong, log the error and show it on screen
            console.error(err);
            document.getElementById('errorText').innerText = err;
            document.getElementById('errorResults').style.display = 'flex';
        });
}

/**
 * This function performs the API call to get a weather forecast and display data on the screen
 * @param {string} value
 * @param {string} apiKey 
 */
function displayForecast(value, apiKey) {

    // Use the API's URL and pass the user-provided city name. Also pass the API key as a param (poor security, not even using https)
    const url = `http://api.openweathermap.org/data/2.5/forecast?q=${value}, US &units=imperial&APPID=${apiKey}`;
    fetch(url)
        .then((response) => {
            // promise resolved forwards the API response in json form
            return response.json();
        })
        .then((json) => {
            // If the success was not successful, throw error
            if (json.cod !== '200') {
                throw `Unable to get data for '${value}':\n${json.message}`;
            }

            // initialize forecast string which will hold the full string to be given in forecastResults div  
            let forecast = '';
            forecast += `<h2>Forecast for ${json.city.name}:</h2>`
            forecast += '<div id="forecastItemContainer">';

            // Initialize forecastDay which will be used to determine whether the current array item
            // is for the same day as the previous one (determines whether or not to create a new forecast day cell)
            let forecastDay = -1;
            json.list.forEach((item) => {
                let thisDate = new Date(item.dt_txt);

                // If the currently evaluated item has a different day from the previous item
                if (thisDate.getDay() !== forecastDay) {

                    // If this isn't the first pass through the loop,
                    // Close out the open divs from the previous item
                    if (forecastDay !== -1) {
                        forecast += '</div>\n</div>\n'
                    }

                    // Update the forecast day for this new item's day
                    forecastDay = thisDate.getDay();
                    forecast += '<div class="forecastItem">\n';

                    // Format the day's information nicely
                    forecast += `<h3 class="forecastDay">${thisDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                    })}</h3>\n
                    <div class="forecastWrapper">`;
                }

                // Put some cool data in the forecast string to be rendered
                forecast += `<div class="forecastTimeItemContainer">\n`;
                forecast += `<div class="forecastTimeItem">\n${moment(item.dt_txt).format('h A')}</div>\n`;
                forecast += `<div class="forecastTimeItem">${item.main.temp} &deg;F</div>\n`;
                item.weather.forEach((weather) => {
                    forecast += `<div class="forecastTimeItem"><img class="iconImg" src='http://openweathermap.org/img/w/${weather.icon}.png'/></div>\n`;
                    forecast += `<div class="forecastTimeItem">${weather.description.charAt(0).toUpperCase() + weather.description.substring(1)}</div>\n`;
                });
                forecast += `<div class="forecastTimeItem">High: ${item.main.temp_max}&deg;</div>\n`;
                forecast += `<div class="forecastTimeItem">Low: ${item.main.temp_min}&deg;</div>\n`;
                forecast += `<div class="forecastTimeItem">Wind: ${item.wind.speed} mph</div>\n`;
                forecast += '</div>\n';

                // this continues to iterate through until all the items in the array have been added to the forecast string
            });

            // Close out the divs for the last forecast day and the forecast item container
            forecast += '</div>\n</div>\n';

            // Render the forecastResults data
            document.getElementById('forecastResults').innerHTML = forecast;

            // Reveal the previously hidden div
            document.getElementById('forecastContainer').style.display = 'flex';
        })
        .catch((err) => {
            // If anything went wrong, log the error and show it on screen
            console.error(err);
            document.getElementById('errorText').innerText = err;
            document.getElementById('errorResults').style.display = 'flex';
        })
        .finally(() => {
            // Regardless of whether an error occurred or the promise was resolved, stop showing the loading indicator
            document.getElementById('loadingIndicator').style.display = 'none';
        });
}

/**
 * This function sets the weatherInput text form input to active when the page is loaded
 * This increases accessibility and makes it easier to use
 */
function setActiveText() {
    document.getElementById('weatherInput').focus();
}

/**
 * Force user to view the page from the top after reload
 * This looks nicer because it hides the footer unless if you scroll down
 */
window.onbeforeunload = () => {
    window.scrollTo(0, 0);
    return;
}