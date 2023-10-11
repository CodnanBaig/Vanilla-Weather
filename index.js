async function getWeather(city, units) {
  try {
    let res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=1b01ec082c6fe3b9967788262c20cf9e`
    );
    let data = await res.json();
    return data;
  } catch (err) {
    console.log("Error: " + err);
    return null;
  }
}
let currentUnits = "metric";
async function getFiveDays(city, units) {
  try {
    let res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${units}&appid=1b01ec082c6fe3b9967788262c20cf9e`
    );
    let data = await res.json();
    // console.log(data);
    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
}

function showCurrent() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (res) => {
        let lat = res.coords.latitude;
        let long = res.coords.longitude;
        // console.log(lat, long);
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=1b01ec082c6fe3b9967788262c20cf9e`
        )
          .then((res) => {
            return res.json();
          })
          .then((data) => {
            let defaultCity = data.name;
            document.getElementById("search").value = defaultCity;
            updateWeatherData(defaultCity, currentUnits);
          })
          .catch((err) => {
            console.error("Error fetching default location: ", err);
          });
      },
      (err) => {
        console.error("Geolocation error: ", err);
      }
    );
  } else {
    console.log("Geolocation is not available.");
  }
}

document.addEventListener("DOMContentLoaded", showCurrent());

let main = document.getElementById("main");
let forecast = document.getElementById("forecast");
forecast.style.display = "none";

function showForecast() {
  let currentDisplayStyle = window.getComputedStyle(forecast).display;
  if (currentDisplayStyle === "none") {
    forecast.style.display = "block";
  } else {
    forecast.style.display = "none";
  }
}

function updateWeatherData(city, units) {
  getWeather(city, units).then((res) => {
    main.style.display = "block";

    let { visibility } = res;
    let { country } = res.sys;
    let { feels_like, temp, pressure, humidity, temp_max, temp_min } = res.main;
    let { icon, description } = res.weather[0];
    let { speed, deg } = res.wind;

    fetch(
      `http://api.weatherapi.com/v1/timezone.json?key=71aa7bf54e654bef92f200605232207&q=${city}`
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        let localTime = data.location.localtime;
        const dateObj = new Date(localTime);
        let formattedLocalTime = dateObj.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        });

        document.getElementById("date-time").textContent = formattedLocalTime;
      });

    document.getElementById("city").textContent = `${city}, ${country}`;
    document.getElementById("temp").textContent = `${Math.round(
      temp.toFixed(1)
    )}°${units === "metric" ? "C" : "F"}`;
    document
      .getElementById("weather-icon")
      .setAttribute("src", `https://openweathermap.org/img/wn/${icon}@2x.png`);
    document.getElementById("desc").textContent = `Feels like ${Math.round(
      feels_like.toFixed(1)
    )}°${units === "metric" ? "C" : "F"}. ${description}`;
    document.getElementById(
      "wind"
    ).innerHTML = `<img id="weather-arrow" src="https://cdn-icons-png.flaticon.com/512/13/13934.png" style="margin-right: 5px; width: 5%;"></img>${speed}m/s WNW`;
    document.getElementById(
      "weather-arrow"
    ).style.transform = `rotate(${deg}deg)`;
    document.getElementById(
      "comp"
    ).innerHTML = `<i class="fa-regular fa-circle" style="margin-right: 10px;"></i>${pressure}hPa`;
    document.getElementById("humidity").textContent = `Humidity: ${humidity}%`;
    document.getElementById("max-temp").textContent = `Max Temp: ${Math.round(
      temp_max.toFixed(1)
    )}°${units === "metric" ? "C" : "F"}`;
    document.getElementById("min-temp").textContent = `Min Temp: ${Math.round(
      temp_min.toFixed(1)
    )}°${units === "metric" ? "C" : "F"}`;
    document.getElementById("visibility").textContent = `Visibility: ${
      visibility / 1000
    }km`;

    document
      .getElementById("map")
      .setAttribute(
        "src",
        `https://www.google.com/maps/embed/v1/place?key=AIzaSyD0Frl1CeKBgwQbWnkO5-bMujMHNIMn9nQ&q=${city}&zoom=15`
      );
  });
}

let parent = document.getElementById("container");
function displayFiveDays(city, units) {
  let currentDateInit = new Date();
  let year = currentDateInit.getFullYear();
  let month = String(currentDateInit.getMonth() + 1).padStart(2, "0");
  let day = String(currentDateInit.getDate()).padStart(2, "0");

  let currentDate = `${year}-${month}-${day}`;
  console.log(currentDate);
  getFiveDays(city, units).then((res) => {
    let data = res.list;
    let fiveDays = data.filter(function (el, i) {
      if (el.dt_txt.endsWith(" 12:00:00")) {
        return el;
      }
    });
    // console.log(fiveDays);
    parent.innerHTML = "";
    fiveDays.forEach(function (el) {
      let card = document.createElement("div");
      let day = document.createElement("h5");
      let iconhtml = document.createElement("img");
      let temphtml = document.createElement("h4");
      let min_temp = document.createElement("p");

      let { icon } = el.weather[0];
      let { dt_txt } = el;
      let { temp, temp_min } = el.main;
      let date = dt_txt.substring(0, 10);
      let dateObj = new Date(date);
      let dayIndex = dateObj.getDay();
      let daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      let dayName = daysOfWeek[dayIndex];

    //   console.log(dayName);

      day.textContent = dayName;
      iconhtml.setAttribute(
        "src",
        `https://openweathermap.org/img/wn/${icon}@2x.png`
      );
      temphtml.textContent = `${Math.round(temp)}°`;
      min_temp.textContent = `${Math.round(temp_min)}°`;
      card.append(day, iconhtml, temphtml, min_temp);
      parent.append(card);
    });
  });
}

document.querySelector("form").addEventListener("submit", function () {
  event.preventDefault();
  let searchVal = document.getElementById("search").value;
  updateWeatherData(searchVal, currentUnits);
  displayFiveDays(searchVal, currentUnits);
});

document.getElementById("metric").addEventListener("click", function () {
  if (currentUnits !== "metric") {
    currentUnits = "metric";
    let searchVal = document.getElementById("search").value;
    updateWeatherData(searchVal, currentUnits);
    displayFiveDays(searchVal, currentUnits);
  }
});

document.getElementById("imperial").addEventListener("click", function () {
  if (currentUnits !== "imperial") {
    currentUnits = "imperial";
    let searchVal = document.getElementById("search").value;
    updateWeatherData(searchVal, currentUnits);
    displayFiveDays(searchVal, currentUnits);
  }
});
