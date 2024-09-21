// HTML elements
const weatherButton = document.getElementById("weatherButton");
const dataResultArea = document.getElementById("mainResults");
const latitudeReadout = document.getElementById("latitudeReadout");
const longitudeReadout = document.getElementById("longitudeReadout");
const currentWind = document.getElementById("currentWind");
const currentTemp = document.getElementById("currentTemp");

// Function to fetch weather data based on latitude and longitude
async function fetchWeatherData(latitude, longitude) {
    try {
        const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability&timezone=auto`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const currentWeather = data.current_weather;
        const currentTemperature = currentWeather.temperature;
        const currentWindSpeed = currentWeather.windspeed;
        const hourlyData = data.hourly;

        // Update the DOM with the current temperature and wind speed
        currentTemp.textContent = `Current Temperature: ${currentTemperature}°C`;
        currentWind.textContent = `Wind Speed: ${currentWindSpeed} km/h`;

        console.log("Current Temperature:", currentTemperature);
        console.log("Current Wind Speed:", currentWindSpeed);

        return hourlyData; // Return hourly data to use in the click event

    } catch (error) {
        console.error("Failed to fetch weather data:", error);
    }
}

// Function to plot the chance of rain using Plotly
function chanceOfRain(hours, precipitationProbabilities) {
    const trace = {
        x: hours,
        y: precipitationProbabilities,
        mode: 'lines',
        type: 'scatter',
        name: 'Precipitation Probability (%)'
    };

    const layout = {
        title: 'Precipitation Probability (Next Hours)',
        xaxis: { title: 'Time' },
        yaxis: { title: 'Probability (%)' }
    };

    Plotly.newPlot('tester', [trace], layout);
}

// Initialize a basic plot in Plotly
TESTER = document.getElementById('tester');
Plotly.newPlot(TESTER, [{
    x: [1, 2, 3, 4, 5],
    y: [1, 2, 4, 8, 16]
}], {
    margin: { t: 0 }
});

// Initialize the map and get the user's current location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        async function (position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const map = L.map('map').setView([latitude, longitude], 13);

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            L.marker([latitude, longitude]).addTo(map)
                .bindPopup('You are here.')
                .openPopup();

            // Add a click event listener to the map
            map.on('click', async function (e) {
                const { lat, lng } = e.latlng;

                // Update the latitude and longitude readouts
                latitudeReadout.textContent = `Latitude: ${lat}`;
                longitudeReadout.textContent = `Longitude: ${lng}`;

                // Fetch the weather data for the clicked location
                const weatherData = await fetchWeatherData(lat, lng);

                if (weatherData) {
                    const hours = weatherData.time;
                    const precipitationProbabilities = weatherData.precipitation_probability;

                    // Plot the chance of rain
                    chanceOfRain(hours, precipitationProbabilities);

                    // Add a marker at the clicked location
                    L.marker([lat, lng]).addTo(map)
                        .bindPopup(`Latitude: ${lat}, Longitude: ${lng}<br>
                                    Temperature: ${weatherData.temperature_2m[0]}°C`)
                        .openPopup();
                }
            });
        },
        function () {
            const defaultLatitude = 51.505;
            const defaultLongitude = -0.09;

            const map = L.map('map').setView([defaultLatitude, defaultLongitude], 13);

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            alert('Unable to retrieve your location. Showing default location.');

            // Add a click event listener to the map
            map.on('click', async function (e) {
                const { lat, lng } = e.latlng;

                // Update the latitude and longitude readouts
                latitudeReadout.textContent = `Latitude: ${lat}`;
                longitudeReadout.textContent = `Longitude: ${lng}`;

                // Fetch the weather data for the clicked location
                const weatherData = await fetchWeatherData(lat, lng);

                if (weatherData) {
                    const hours = weatherData.time;
                    const precipitationProbabilities = weatherData.precipitation_probability;

                    // Plot the chance of rain
                    chanceOfRain(hours, precipitationProbabilities);

                    // Add a marker at the clicked location
                    L.marker([lat, lng]).addTo(map)
                        .bindPopup(`Latitude: ${lat}, Longitude: ${lng}`)
                        .openPopup();
                }
            });
        }
    );
} else {
    alert('Geolocation is not supported by your browser.');
}

// Button click handler to fetch weather data based on the current location
const myClickHandler = async function (event) {
    navigator.geolocation.getCurrentPosition(async function (position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Update the latitude and longitude readouts
        latitudeReadout.textContent = `Latitude: ${latitude}`;
        longitudeReadout.textContent = `Longitude: ${longitude}`;

        // Fetch the weather data using the current position
        const weatherData = await fetchWeatherData(latitude, longitude);

        if (weatherData) {
            const hours = weatherData.time;
            const precipitationProbabilities = weatherData.precipitation_probability;

            // Plot the chance of rain
            chanceOfRain(hours, precipitationProbabilities);
        }
    });
}



// Attach the click event handler to the button
orientationButton.addEventListener('click', myClickHandler);

function updateOrientation(event) {    
    // Update the orientation display
    document.getElementById('alphaReadout').textContent = `z-axis rotation: ${Math.round(event.alpha)}°`;
    document.getElementById('betaReadout').textContent = `x-axis rotation: ${Math.round(event.beta)}°`;
    document.getElementById('gammaReadout').textContent = `y-axis rotation: ${Math.round(event.gamma)}°`;
}

window.addEventListener('deviceorientation', updateOrientation, true);

if (DeviceOrientationEvent.requestPermission) { DeviceOrientationEvent.requestPermission(); };




// Get the video element
const videoElement = document.getElementById('videoElement');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');

let mediaStream = null;

// Function to start capturing audio and video
async function startMedia() {
    try {
        // Get the user's video and audio stream
        mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,   // Access video (camera)
            audio: true    // Access audio (microphone)
        });

        // Set the video element's source to the media stream
        videoElement.srcObject = mediaStream;
    } catch (error) {
        console.error('Error accessing media devices.', error);
    }
}

// Function to stop the media stream
function stopMedia() {
    if (mediaStream) {
        const tracks = mediaStream.getTracks();
        tracks.forEach(track => track.stop());  // Stop all tracks (audio and video)
        videoElement.srcObject = null;
    }
}

// Event listeners for start and stop buttons
startButton.addEventListener('click', startMedia);
stopButton.addEventListener('click', stopMedia);
