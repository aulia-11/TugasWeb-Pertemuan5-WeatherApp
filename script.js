const API_KEY = "be5f787bd9abd5fd9e98ab974fd9714e";

const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");
const weatherResult = document.getElementById("weatherResult");

const cityName = document.getElementById("cityName");
const weatherDescription = document.getElementById("weatherDescription");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");

const celsiusBtn = document.getElementById("celsiusBtn");
const fahrenheitBtn = document.getElementById("fahrenheitBtn");

const searchHistory = document.getElementById("searchHistory");

let currentTemperature = null;
let currentUnit = "celsius";

/* =========================
   FETCH WEATHER DATA
========================= */

const getWeather = async (city) => {

    showLoading();

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=id`;

    try {

        const response = await fetch(url);

        if (!response.ok) {

            if (response.status === 404) {
                throw new Error("Kota tidak ditemukan.");
            }

            throw new Error("Terjadi kesalahan saat mengambil data cuaca.");
        }

        const data = await response.json();

        displayWeather(data);

        saveToHistory(city);

    } catch (error) {

        showError(
            error.message.includes("Failed to fetch")
                ? "Network error. Periksa koneksi internet kamu."
                : error.message
        );

    } finally {

        hideLoading();

    }
};

/* =========================
   DISPLAY WEATHER
========================= */

const displayWeather = (data) => {

    weatherResult.classList.remove("hidden");
    errorMessage.classList.add("hidden");

    cityName.textContent = `${data.name}, ${data.sys.country}`;

    weatherDescription.textContent =
        data.weather[0].description;

    weatherIcon.src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    weatherIcon.alt =
        data.weather[0].description;

    currentTemperature = data.main.temp;

    temperature.textContent =
        `${Math.round(currentTemperature)}°C`;

    humidity.textContent =
        `${data.main.humidity}%`;

    windSpeed.textContent =
        `${data.wind.speed} m/s`;
};

/* =========================
   LOADING
========================= */

const showLoading = () => {

    loading.classList.remove("hidden");
    weatherResult.classList.add("hidden");
    errorMessage.classList.add("hidden");

};

const hideLoading = () => {

    loading.classList.add("hidden");

};

/* =========================
   ERROR
========================= */

const showError = (message) => {

    errorMessage.textContent = message;

    errorMessage.classList.remove("hidden");

    weatherResult.classList.add("hidden");

};

/* =========================
   SEARCH
========================= */

searchForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const city = cityInput.value.trim();

    if (city === "") {

        showError("Silakan masukkan nama kota.");

        return;
    }

    getWeather(city);

    cityInput.value = "";

});

/* =========================
   TEMPERATURE TOGGLE
========================= */

celsiusBtn.addEventListener("click", () => {

    if (currentTemperature === null) {
        return;
    }

    currentUnit = "celsius";

    temperature.textContent =
        `${Math.round(currentTemperature)}°C`;

    celsiusBtn.classList.add("active");
    fahrenheitBtn.classList.remove("active");

});

fahrenheitBtn.addEventListener("click", () => {

    if (currentTemperature === null) {
        return;
    }

    currentUnit = "fahrenheit";

    const fahrenheit =
        (currentTemperature * 9 / 5) + 32;

    temperature.textContent =
        `${Math.round(fahrenheit)}°F`;

    fahrenheitBtn.classList.add("active");
    celsiusBtn.classList.remove("active");

});

/* =========================
   LOCAL STORAGE
========================= */

const saveToHistory = (city) => {

    let history =
        JSON.parse(localStorage.getItem("weatherHistory")) || [];

    const cityExists =
        history.some(
            item => item.toLowerCase() === city.toLowerCase()
        );

    if (!cityExists) {

        history.unshift(city);

        history = history.slice(0, 5);

        localStorage.setItem(
            "weatherHistory",
            JSON.stringify(history)
        );

    }

    displayHistory();

};

/* =========================
   DISPLAY HISTORY
========================= */

const displayHistory = () => {

    const history =
        JSON.parse(localStorage.getItem("weatherHistory")) || [];

    if (history.length === 0) {

        searchHistory.innerHTML =
            `<p class="empty-history">
                Belum ada riwayat pencarian.
            </p>`;

        return;
    }

    searchHistory.innerHTML = history
        .map(city => `
            <button class="history-item"
                    data-city="${city}">
                ${city}
            </button>
        `)
        .join("");

    document
        .querySelectorAll(".history-item")
        .forEach(button => {

            button.addEventListener("click", () => {

                getWeather(button.dataset.city);

            });

        });

};

/* =========================
   INITIALIZE
========================= */

displayHistory();