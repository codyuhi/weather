document.getElementById('weatherSubmit').addEventListener('click', async (event) => {
    event.preventDefault();
    document.getElementById('loadingIndicator').style.display = 'flex';
    document.getElementById('errorResults').style.display = 'flex';
    const value = document.getElementById('weatherInput').value;
    const apiKey = '';
    if (value === '') {
        document.getElementById('loadingIndicator').style.display = 'none';
        return;
    }
    try {
        await displayCurrentConditions(value, apiKey);
        await displayForecast(value, apiKey);
    } catch {
        document.getElementById('loadingIndicator').style.display = 'none';
    }
});

function displayCurrentConditions(value, apiKey) {
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${value},US&units=imperial&APPID=${apiKey}`;
    fetch(url)
        .then((response) => {
            return response.json();
        })
        .then((json) => {
            console.log('Current Conditions data:', json);
            if(json.cod !== '200') {
                throw `Unable to get data for city: ${json.message}`;
            }
            let results = '';
            results += `<h2>Weather in ${json.name}</h2>\n`;
            json.weather.forEach((weather) => {
                results += `\t<img src='http://openweathermap.org/img/w/${weather.icon}.png'/>`;
            });
            results += `<h2>${json.main.temp} &deg;F</h2>\n<p>`;
            for (let i = 0; i < json.weather.length; i++) {
                results += json.weather[i].description;
                if (i !== json.weather.length - 1) {
                    results += ', ';
                }
            }
            results += '</p>';
            document.getElementById('weatherResults').innerHTML = results;
        })
        .catch((err) => {
            console.error(err);
            document.getElementById('errorText').innerText = err;
            document.getElementById('errorResults').style.display = 'flex';
        });
}

function displayForecast(value, apiKey) {
    const url = `http://api.openweathermap.org/data/2.5/forecast?q=${value}, US &units=imperial&APPID=${apiKey}`;
    fetch(url)
        .then((response) => {
            return response.json();
        })
        .then((json) => {
            console.log('forecast data:', json);
            if(json.cod !== '200') {
                throw `Unable to get data for city: ${json.message}`;
            }
            let forecast = '';
            json.list.forEach((item) => {
                forecast += `<h2>${moment(item.dt_txt).format('MMMM Do YYYY, h:mm:ss a')}</h2>`;
                forecast += `\t<p>Temperature: ${item.main.temp}</p>`;
                forecast += `\t<img src='http://openweathermap.org/img/w/${item.weather[0].icon}.png'/>`;
            });
            document.getElementById('forecastResults').innerHTML = forecast;
        })
        .catch((err) => {
            console.error(err);
            document.getElementById('errorText').innerText = err;
            document.getElementById('errorResults').style.display = 'flex';
        })
        .finally(() => {
            document.getElementById('loadingIndicator').style.display = 'none';
        });
}