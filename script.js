let weatherData;
let city = "Muktinath";
let unit = "C";
let selectedView = "week";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const todayBtn = document.getElementById("todayBtn");
const weekBtn = document.getElementById("weekBtn");
const celsiusBtn = document.getElementById("celsiusBtn");
const fahrenheitBtn = document.getElementById("fahrenheitBtn");

function getIcon(weatherCode, isDay = true) {
    if (weatherCode === 0) return isDay ? "https://i.ibb.co/rb4rrJL/26.png" : "https://i.ibb.co/1nxNGHL/10.png";
    if ([1, 2].includes(weatherCode)) return isDay ? "https://i.ibb.co/PZQXH8V/27.png" : "https://i.ibb.co/Kzkk59k/15.png";
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) return "https://i.ibb.co/kBd2NTS/39.png";
    return isDay ? "https://i.ibb.co/PZQXH8V/27.png" : "https://i.ibb.co/Kzkk59k/15.png";
}

function getBackground(weatherCode, isDay = true) {
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) return "https://i.ibb.co/h2p6Yhd/rain.webp";
    if ([1, 2].includes(weatherCode)) return isDay ? "https://i.ibb.co/qNv7NxZ/pc.webp" : "https://i.ibb.co/RDfPqXz/pcn.jpg";
    return isDay ? "https://i.ibb.co/WGry01m/cd.jpg" : "https://i.ibb.co/kqtZ1Gx/cn.jpg";
}

function getCondition(code) {
    const conditions = {
        0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
        45: "Fog", 48: "Rime fog", 51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
        61: "Light rain", 63: "Rain", 65: "Heavy rain", 71: "Light snow", 73: "Snow",
        75: "Heavy snow", 80: "Rain showers", 81: "Rain showers", 82: "Heavy rain showers",
        95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with hail"
    };
    return conditions[code] || "Unknown";
}

function toFahrenheit(celsius) {
    return (celsius * 9 / 5) + 32;
}

function formatTemperature(value) {
    if (value === undefined || value === null) return "--";
    const temp = unit === "F" ? toFahrenheit(value) : value;
    return Math.round(temp * 10) / 10;
}

function formatTime(time) {
    if (!time) return "--";
    const date = new Date(time);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function getDayName(dateString) {
    return new Date(dateString + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" });
}

function getCurrentDate() {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
        weekday: "long", hour: "numeric", minute: "2-digit"
    });
}

function showCurrentWeather() {
    const current = weatherData.current;
    const daily = weatherData.daily;
    const isDay = current.is_day === 1;

    document.getElementById("currentTemp").textContent = formatTemperature(current.temperature_2m);
    document.getElementById("currentDate").textContent = getCurrentDate();
    document.getElementById("conditionText").textContent = getCondition(current.weather_code);
    document.getElementById("rainChance").textContent = current.precipitation_probability ?? 0;
    document.getElementById("locationName").textContent = weatherData.locationName;
    document.getElementById("mainIcon").src = getIcon(current.weather_code, isDay);

    document.body.style.backgroundImage = "url('" + getBackground(current.weather_code, isDay) + "')";

    const uv = daily.uv_index_max[0] ?? 0;
    document.getElementById("uvIndex").textContent = Math.round(uv * 10) / 10;
    document.getElementById("uvText").textContent = getUVText(uv);
    document.getElementById("windStatus").textContent = Math.round(current.wind_speed_10m ?? 0);
    document.getElementById("humidity").textContent = Math.round(current.relative_humidity_2m ?? 0) + "%";
    document.getElementById("humidityText").textContent = getHumidityText(current.relative_humidity_2m ?? 0);
    document.getElementById("visibility").textContent = current.visibility == null ? "--" : (current.visibility / 1000).toFixed(1) + " km";
    document.getElementById("sunrise").textContent = formatTime(daily.sunrise[0]);
    document.getElementById("sunset").textContent = formatTime(daily.sunset[0]);

    const air = weatherData.airQuality?.current?.us_aqi ?? 0;
    document.getElementById("airQuality").textContent = air;
    document.getElementById("airText").textContent = getAirText(air);
}

function getUVText(uv) {
    if (uv <= 2) return "Low";
    if (uv <= 5) return "Moderate";
    if (uv <= 7) return "High";
    if (uv <= 10) return "Very High";
    return "Extreme";
}

function getHumidityText(value) {
    if (value >= 70) return "High";
    if (value >= 40) return "Normal";
    return "Low";
}

function getAirText(value) {
    if (value <= 50) return "Good 👌";
    if (value <= 100) return "Moderate";
    if (value <= 150) return "Unhealthy for sensitive groups";
    return "Unhealthy";
}

function showWeek() {
    let html = '<div class="forecast-week">';

    weatherData.daily.time.slice(0, 7).forEach(function(date, index) {
        html += `
            <div class="forecast-day">
                <h3>${getDayName(date)}</h3>
                <img src="${getIcon(weatherData.daily.weather_code[index], true)}" alt="weather">
                <p>${formatTemperature(weatherData.daily.temperature_2m_max[index])}°${unit}</p>
            </div>
        `;
    });

    html += '</div>';
    document.getElementById("forecastArea").innerHTML = html;
}

function showToday() {
    const hours = weatherData.hourly;
    let html = '<div class="hour-grid">';

    for (let i = 0; i < hours.time.length; i++) {
        const date = new Date(hours.time[i]);
        const now = new Date();
        if (date.toDateString() !== now.toDateString()) continue;

        html += `
            <div class="hour-card">
                <h3>${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</h3>
                <img src="${getIcon(hours.weather_code[i], true)}" alt="weather">
                <p>${formatTemperature(hours.temperature_2m[i])}°${unit}</p>
            </div>
        `;
    }

    html += '</div>';
    document.getElementById("forecastArea").innerHTML = html;
}

function changeView(view) {
    selectedView = view;

    if (view === "week") {
        weekBtn.classList.add("active");
        todayBtn.classList.remove("active");
        showWeek();
    } else {
        todayBtn.classList.add("active");
        weekBtn.classList.remove("active");
        showToday();
    }
}

async function getWeather() {
    try {
        const locationResponse = await fetch(
            "https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(city) + "&count=1&language=en&format=json"
        );

        if (!locationResponse.ok) throw new Error("Location search failed");

        const locationData = await locationResponse.json();
        if (!locationData.results || locationData.results.length === 0) {
            throw new Error("City not found");
        }

        const location = locationData.results[0];

        const weatherResponse = await fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=" + location.latitude +
            "&longitude=" + location.longitude +
            "&current=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m,visibility,is_day" +
            "&hourly=temperature_2m,weather_code" +
            "&daily=weather_code,temperature_2m_max,sunrise,sunset,uv_index_max" +
            "&timezone=auto&forecast_days=7"
        );

        if (!weatherResponse.ok) throw new Error("Weather request failed");
        const weather = await weatherResponse.json();

        let airQuality = null;
        try {
            const airResponse = await fetch(
                "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=" + location.latitude +
                "&longitude=" + location.longitude +
                "&current=us_aqi&timezone=auto"
            );
            if (airResponse.ok) airQuality = await airResponse.json();
        } catch (airError) {
            console.log("Air quality unavailable", airError);
        }

        weatherData = {
            ...weather,
            locationName: [location.name, location.country].filter(Boolean).join(", "),
            airQuality: airQuality
        };

        showCurrentWeather();
        changeView(selectedView);
    } catch (error) {
        console.error(error);
        alert("Unable to get weather. Please enter a valid city.");
    }
}

searchBtn.addEventListener("click", function() {
    const value = cityInput.value.trim();
    if (value !== "") {
        city = value;
        getWeather();
    }
});

cityInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") searchBtn.click();
});

todayBtn.addEventListener("click", function() {
    if (weatherData) changeView("today");
});

weekBtn.addEventListener("click", function() {
    if (weatherData) changeView("week");
});

celsiusBtn.addEventListener("click", function() {
    unit = "C";
    celsiusBtn.classList.add("selected");
    fahrenheitBtn.classList.remove("selected");
    if (weatherData) {
        showCurrentWeather();
        changeView(selectedView);
    }
});

fahrenheitBtn.addEventListener("click", function() {
    unit = "F";
    fahrenheitBtn.classList.add("selected");
    celsiusBtn.classList.remove("selected");
    if (weatherData) {
        showCurrentWeather();
        changeView(selectedView);
    }
});

getWeather();
