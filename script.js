const cityInput = document.querySelector(".city-input");
const searchButtton = document.querySelector(".search-btn");
const locationButtton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
document.addEventListener("DOMContentLoaded", () => {
    const currentWeatherDiv = document.querySelector(".current-weather");
    currentWeatherDiv.classList.add("loaded");
});





const API_KEY = "050906acb2724c53539777b79ddceb30";

const createWeatherCard = (cityName, weatherItem, index) => {
    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split("-");
        return `${day}-${month}-${year}`;
    };

    const formattedDate = formatDate(weatherItem.dt_txt.split(" ")[0]);
    if (index === 0) {
        return `<div class="details">
                    <h2>${cityName} (${formattedDate})</h2>
                    <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4> 
                    <h4>Wind: ${((weatherItem.wind.speed) * 3.6).toFixed(0)}Km/h</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h3>${weatherItem.weather[0].description}</h3>
                </div>`;
    } else {
        return `<li class="card">
                <h3>(${formattedDate})</h3>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4> 
                <h4>Wind: ${((weatherItem.wind.speed) * 3.6).toFixed(0)}Km/h</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                <h3>${weatherItem.weather[0].description}</h3>
            </li>`;
    }

}


const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        //Filter the forecasts to get only one forecast per day
        const uniqueForecastDay = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDay.includes(forecastDate)) {
                return uniqueForecastDay.push(forecastDate);
            }
        });

        //Clearinng previous weather data
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";


        //creating weather cards and adding them to the dom
        console.log(fiveDaysForecast);
        fiveDaysForecast.forEach((weatherItem, index) => {
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }
        });

    }).catch(() => {
        alert("An error occured while fetching the weather forecast!")
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();  // get user entered city name & remove extra spaces
    if (!cityName) return;
    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        if (!data.length) return alert(`No Coordinatees found for ${cityName}`);
        const { name, lat, lon } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occured while fetching the coordinates!")
    });
}


const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            //Get city name from coordinates using reverse gecoding api
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                console.log(data);
                const name = data[0].name;
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("An error occured while fetching the city!")
            });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            }
        }
    );
}



locationButtton.addEventListener("click", getUserCoordinates);
searchButtton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates())