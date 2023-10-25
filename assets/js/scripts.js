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

    axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${encodeURI(search_text)}&limit=5&appid=df8247dcd9dd7cda212d9d442b63600e`).then(res => {
        let city = res.data[0];

        if (city != undefined) {
            var city_name = city.name;

            axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&units=metric&lang=pt_br&appid=df8247dcd9dd7cda212d9d442b63600e`).then(res => {
                let data = {
                    temp: Math.round(res.data.main.temp),
                    humidity: res.data.main.humidity + '%',
                    wind: (res.data.wind.speed * 3.6).toFixed(2) + 'km/h',
                    icon: 'https://openweathermap.org/img/wn/' + res.data.weather[0].icon + '@2x.png'
                };

                document.getElementsByClassName('weather__city')[0].innerText = city_name;
                document.getElementById('temp').innerText = data.temp;
                document.getElementById('humidity').innerText = data.humidity;
                document.getElementById('wind').innerText = data.wind;
            })
        }
    }).catch(err => {
        console.log(err);
    })
}