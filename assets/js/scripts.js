window.addEventListener('load', () => {
    const search_form = document.querySelector('#search__form');
    const search_btn = document.querySelector('.header__btn');

    search_form.addEventListener('submit', async (event) => {event.preventDefault(); await updateForecast()});
    search_btn.addEventListener('click', async (event) => {event.preventDefault(); await updateForecast()});

    const storedCity = localStorage.getItem('storedCity');

    if (storedCity) {
        updateForecast(storedCity);
    }
});

async function updateForecast(search_text = false) {
    if (!search_text) {
        search_text = document.querySelector('.header__input').value;
    }

    if (search_text == '') {
        return false;
    }

    try {
        const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURI(search_text)}&units=metric&lang=pt_br&appid=df8247dcd9dd7cda212d9d442b63600e`);

        changeScreenData({
            timezone: res.data.timezone / 60,
            timestamp: new Date(res.data.dt * 1000),
            sunrise: new Date(res.data.sys.sunrise * 1000),
            sunset: new Date(res.data.sys.sunset * 1000),
            weather_id: res.data.weather[0].id,
            city: `${res.data.name} - ${res.data.sys.country}`,
            temp: Math.round(res.data.main.temp),
            humidity: res.data.main.humidity + '%',
            wind: (res.data.wind.speed * 3.6).toFixed(1) + 'km/h',
            icon: 'https://openweathermap.org/img/wn/' + res.data.weather[0].icon + '@2x.png'
        });

        localStorage.setItem('storedCity', search_text);
    } catch (err) {
        document.querySelector('section.weather').classList.remove('active');
        document.querySelector('.no__weather').classList.add('active');
        console.log(err);
    }
}

function changeScreenData(data) {
    document.querySelector('section.weather').classList.add('active');
    document.querySelector('.no__weather').classList.remove('active');
    document.querySelector('.header__input').value = '';
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
        syncTimezone(data);

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

function syncTimezone(data) {
    let time = data.timestamp;
    let sunrise = data.sunrise;
    let sunset = data.sunset;

    time.setMinutes(time.getMinutes() + time.getTimezoneOffset() + data.timezone);
    sunrise.setMinutes(sunrise.getMinutes() + sunrise.getTimezoneOffset() + data.timezone);
    sunset.setMinutes(sunset.getMinutes() + sunset.getTimezoneOffset() + data.timezone);
}