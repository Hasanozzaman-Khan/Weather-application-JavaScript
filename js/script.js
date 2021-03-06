console.log('ready');
let searchInp = document.querySelector('.weather_search');
let city = document.querySelector('.weather_city');
let day = document.querySelector('.weather_day');
let humidity = document.querySelector('.weather_indicator-humidity>.value');
let wind = document.querySelector('.weather_indicator-wind>.value');
let pressure = document.querySelector('.weather_indicator-pressure>.value');
let image = document.querySelector('.weather_image');
// let imageToday = document.querySelector('.weather_image_today');
let temperature = document.querySelector('.weather_temperature>.value');
let forecastBlock = document.querySelector('.weather_forecast');
let suggestions = document.querySelector('#suggestions');

let weatherAPIKey = 'fded96a3bb8cb38fe08d1aae1d873197';
let weatherBaseEndPoint = 'https://api.openweathermap.org/data/2.5/weather?units=metric&appid=' + weatherAPIKey;
let forecastBaseEndPoint = 'https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=' + weatherAPIKey;
let cityBaseEndPoint = 'https://api.teleport.org/api/cities/?search=';


let weatherImages = [
  {
    url: 'images/clear-sky.png',
    ids: [800]
  },
  {
    url: 'images/broken-clouds.png',
    ids: [803, 804]
  },
  {
    url: 'images/few-clouds.png',
    ids: [801]
  },
  {
    url: 'images/mist.png',
    ids: [701, 711, 721, 731, 741, 751, 761, 762, 771, 781]
  },
  {
    url: 'images/rain.png',
    ids: [500, 501, 502, 503, 504]
  },
  {
    url: 'images/scattered-clouds.png',
    ids: [802]
  },
  {
    url: 'images/shower-rain.png',
    ids: [520, 521, 522, 531, 300, 301, 302, 310, 311, 312, 313, 314, 321]
  },
  {
    url: 'images/snow.png',
    ids: [511, 600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622]
  },
  {
    url: 'images/thunderstorm.png',
    ids: [200, 201, 202, 210, 211, 212, 230, 231, 232]
  }
];


let getWeatherByCityName = async (cityString) =>{
  let city;

  if (cityString.includes(',')) {
    city = cityString.substring(0, cityString.indexOf(',')) + cityString.substring(cityString.lastIndexOf(','));
  }else {
    city = cityString;
  }

  let endpoint = weatherBaseEndPoint + '&q=' + city;
  let response = await fetch(endpoint);

  if (response.status !== 200) {
    alert('City not found!');
    return;
  }

  let weather = await response.json();
  return weather;
}


let getForecastByCityId = async (id) =>{
  let endpoint = forecastBaseEndPoint + '&id=' + id;
  let result = await fetch(endpoint);
  let forecast = await result.json();
  let forecastList = forecast.list;
  let daily = [];

  forecastList.forEach( day => {
    let date = new Date(day.dt_txt.replace(' ', 'T'));
    let hours = date.getHours();

    if (hours === 12) {
      daily.push(day);
    }

  });
  return daily;
}


let weatherForCity = async (city) => {
  let weather = await getWeatherByCityName(city);

  if (!weather) {
    return;
  }

  let cityId = weather.id;
  updateCurrentWeather(weather);
  let forecast = await getForecastByCityId(cityId);
  updateForecast(forecast);
}


let init = () => {
  weatherForCity('Dubai').then(() => document.body.style.filter = 'blur(0)');
}
init();


searchInp.addEventListener('keydown', async (e)=>{
  if (e.keyCode === 13) {
    weatherForCity(searchInp.value);
  }
});


searchInp.addEventListener('input', async () =>{
  let endpoint = cityBaseEndPoint + searchInp.value;
  let result = await (await fetch(endpoint)).json();
  suggestions.innerHTML = '';
  let cities = result._embedded['city:search-results'];
  let length = cities.length > 5 ? 5 : cities.length;

  for (let i = 0; i < length; i++) {
    let option = document.createElement('option');
    option.value = cities[i].matching_full_name;
    suggestions.append(option);
  }

});


let updateCurrentWeather = (data) => {
  city.textContent = data.name + ', ' + data.sys.country;
  day.textContent = dayOfWeek();
  humidity.textContent = data.main.humidity;

  let windDirection;
  let deg = data.wind.deg;

  if (deg > 45 && deg <= 135) {
    windDirection = 'East';
  }else if (deg > 135 && deg <= 225) {
    windDirection = 'South';
  }else if (deg > 225 && deg <= 315) {
    windDirection = 'West';
  }else {
    windDirection = 'North';
  }

  wind.textContent = windDirection + ', ' + data.wind.speed;
  pressure.textContent = data.main.pressure;

// Way 1 to add image
  // imageToday.innerHTML = '';
  // let iconURL = 'http://openweathermap.org/img/wn/' + data.weather[0].icon + '@2x.png';
  // let weatherImage = `<img src="${iconURL}" alt="clear sky" class="weather_image">`;
  // imageToday.insertAdjacentHTML('beforeend', weatherImage);

// Way 2 to add image
  // let iconURL = 'http://openweathermap.org/img/wn/' + data.weather[0].icon + '@2x.png';
  // image.src = iconURL;

// Way 3 to add image
  let imgID =data.weather[0].id;

  weatherImages.forEach( obj => {

    if (obj.ids.includes(imgID)) {
      image.src = obj.url;
    }

  });

  temperature.textContent = data.main.temp > 0 ? '+' + data.main.temp : data.main.temp;
}


let updateForecast = (forecast) =>{
  forecastBlock.innerHTML = '';

  forecast.forEach((day) => {
    let iconURL = 'http://openweathermap.org/img/wn/' + day.weather[0].icon + '@2x.png';
    let dayName = dayOfWeek(day.dt * 1000);
    let temperature = day.main.temp > 0 ? '+' + Math.round(day.main.temp) : Math.round(day.main.temp);

    let forecastItem = `
      <article class="weather_forecast_item">
        <img src="${iconURL}" alt="${day.weather[0].description}" class="weather_forecast_icon">
        <h3 class="weather_forecast_day">${dayName}</h3>
        <p class="weather_forecast_temperature"><span class="value">${temperature}</span> &deg;C</p>
      </article>
    `;
    forecastBlock.insertAdjacentHTML('beforeend', forecastItem);
  });

}


let dayOfWeek = (dt = new Date().getTime()) => {
  return new Date(dt).toLocaleDateString('en-EN', {'weekday': 'long'});
}
