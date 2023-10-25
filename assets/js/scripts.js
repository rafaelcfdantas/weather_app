const search_form = document.querySelector('#search__form');
const search_input = document.querySelector('.header__input');
const search_btn = document.querySelector('.header__btn');

search_form.addEventListener('submit', event => updateForecast(event));
search_btn.addEventListener('click', event => updateForecast(event));

function updateForecast(event) {
    event.preventDefault();

    let search_text = search_input.value;

    if (search_text == '') {
        return false;
    }

    axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${encodeURI(search_text)}&appid=df8247dcd9dd7cda212d9d442b63600e`).then(res => {
        let city = res.data[0];

        if (city != undefined) {
            var city_name = city.name;

            axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&units=metric&lang=pt_br&appid=df8247dcd9dd7cda212d9d442b63600e`).then(res => {
                let data = {
                    timezone: res.data.timezone / 60,
                    timestamp: new Date(res.data.dt * 1000),
                    sunrise: new Date(res.data.sys.sunrise * 1000),
                    sunset: new Date(res.data.sys.sunset * 1000),
                    weather_id: res.data.weather[0].id,
                    city: city_name,
                    temp: Math.round(res.data.main.temp),
                    humidity: res.data.main.humidity + '%',
                    wind: (res.data.wind.speed * 3.6).toFixed(1) + 'km/h',
                    icon: 'https://openweathermap.org/img/wn/' + res.data.weather[0].icon + '@2x.png'
                };

                changeScreenData(data);
            })
        }
    }).catch(err => {
        console.log(err);
    })
}

function changeScreenData(data) {
    document.getElementById('weather__img').src = data.icon;
    document.getElementById('weather__city').innerText = data.city;
    document.getElementById('temp').innerText = data.temp;
    document.getElementById('humidity').innerText = data.humidity;
    document.getElementById('wind').innerText = data.wind;

    const container = document.querySelector('main.container');
    container.classList.remove('morning', 'sun', 'sunset', 'rain', 'night');

    if (/^[2|3|5|6][0-9][0-9]|80[2-4]/.test(data.weather_id)) {
        // cloudy or raining
        container.classList.add('rain');
    } else {
        // clear sky
        updateTimezone(data);

        let actual_hour = data.timestamp.getHours();
        let sunrise_hour = data.sunrise.getHours();
        let sunset_hour = data.sunset.getHours();

        if (actual_hour < sunrise_hour || actual_hour > sunset_hour) {
            container.classList.add('night');
        } else if (actual_hour == sunrise_hour) {
            container.classList.add('morning');
        } else if (actual_hour == sunset_hour) {
            container.classList.add('sunset');
        } else {
            container.classList.add('sun');
        }
    }
}

function updateTimezone(data) {
    let time = data.timestamp;
    let sunrise = data.sunrise;
    let sunset = data.sunset;

    time.setMinutes(time. getMinutes() + time.getTimezoneOffset() + data.timezone);
    sunrise.setMinutes(sunrise. getMinutes() + sunrise.getTimezoneOffset() + data.timezone);
    sunset.setMinutes(sunset. getMinutes() + sunset.getTimezoneOffset() + data.timezone);
}