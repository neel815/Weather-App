const userTab = document.querySelector("[data-userweather]");
const searchTab = document.querySelector("[data-searchweather]");
const usercontainer = document.querySelector(".weather-container");
const grantAccesscontainer = document.querySelector(".grant-location-page");
const searchForm = document.querySelector("[data-searchform]");
const loadingscreen = document.querySelector(".loading-container");
const userInfocontainer = document.querySelector(".user-info-container");

//initially
let currTab = userTab;
const API_key = "931e7937887836c01ec675f748f5f30c";
currTab.classList.add("curr-tab");
getfromSessionStorage();

function switchTab(clickedTab) {
    if (clickedTab !== currTab) {
        currTab.classList.remove("curr-tab");
        currTab = clickedTab;
        currTab.classList.add("curr-tab");

        if (!searchForm.classList.contains("active")) {
            userInfocontainer.classList.remove("active");
            grantAccesscontainer.classList.remove("active");
            searchForm.classList.add("active");
        } else {
            // Switch from search weather to user weather page
            searchForm.classList.remove("active");
            userInfocontainer.classList.remove("active");
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => {
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    switchTab(searchTab);
});

function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
        // Show grant access container if no coordinates found
        grantAccesscontainer.classList.add("active");
    } else {
        const coordinates = JSON.parse(localCoordinates);
        fetchWeatherByCoordinates(coordinates);
        // fetchWeatherByCity(coordinates);
    }
}

//this is for user weather
async function fetchWeatherByCoordinates(coordinates) {
    const { lat, lon } = coordinates;
    grantAccesscontainer.classList.remove("active");
    loadingscreen.classList.add("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}`
        );
        const data = await response.json();
        loadingscreen.classList.remove("active");
        userInfocontainer.classList.add("active");
        renderWeatherinfo(data);
    } catch (err) {
        loadingscreen.classList.remove("active");
        console.error("Error fetching weather data: ", err);
    }
}

function renderWeatherinfo(weatherinfo) {
    const cityname = document.querySelector("[data-cityname]");
    const countryicon = document.querySelector("[data-countryicon]");
    const weatherdesc = document.querySelector("[data-weatherdesc]");
    const weathericon = document.querySelector("[data-weathericon]");
    const temp = document.querySelector("[data-temprature]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const clouds = document.querySelector("[data-clouds]");

    cityname.innerText = weatherinfo?.name;
    countryicon.src = `https://flagcdn.com/144x108/${weatherinfo?.sys?.country.toLowerCase()}.png`;
    weatherdesc.innerText = weatherinfo?.weather?.[0]?.description;
    weathericon.src = `https://openweathermap.org/img/w/${weatherinfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${(weatherinfo.main?.temp - 273.15).toFixed(1)}°C`; // Convert Kelvin to Celsius
    windspeed.innerText = `${weatherinfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherinfo?.main?.humidity}%`;
    clouds.innerText = `${weatherinfo?.clouds?.all}%`;
}

function getlocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showposition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showposition(position) {
    const usercoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };
    sessionStorage.setItem("user-coordinates", JSON.stringify(usercoordinates));
    fetchWeatherByCoordinates(usercoordinates);
}

const grantlocation = document.querySelector("[data-grantaccess]");
grantlocation.addEventListener("click", getlocation);

const searchinput = document.querySelector("[data-searchinput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();//we don't want to reload whole page everytime after entering the name of city
    let cityname = searchinput.value;

    if (cityname === "") {
        return;
    } else {
        fetchWeatherByCity(cityname);
    }
});

//this is for searchweather
async function fetchWeatherByCity(city) {
    loadingscreen.classList.add("active");
    userInfocontainer.classList.remove("active"); // Hide weather info container
    grantAccesscontainer.classList.remove("active"); // Hide grant location container
    document.querySelector('.error-container').style.display = 'none'; // Hide error container initially

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}`
        );
        const data = await response.json();

        loadingscreen.classList.remove("active");

        if (data.cod === "404") {
            // If city is not found, show the 404 error container and keep search bar visible
            document.querySelector('.error-container').style.display = 'flex'; // Show error container
            userInfocontainer.classList.remove("active"); // Ensure weather info is hidden
        } else {
            // If city is valid, hide error container and show weather info
            document.querySelector('.error-container').style.display = 'none'; // Hide error container
            userInfocontainer.classList.add("active"); // Show weather info
            renderWeatherinfo(data);
        }
    } catch (err) {
        console.error("Error fetching weather data: ", err);
        loadingscreen.classList.remove("active");
    }
}
