const locationTimezone = document.querySelector('.location')
const weatherIcon = document.querySelector('.icon');
const degreeNum = document.querySelector('.degree .number')
const degreeType = document.querySelector('.degree-type')
const feelsLikeDegreeNum = document.querySelector('.feels-like-number')
const feelsLikeDegreeType = document.querySelector('.feels-like .degree-type')
const sunRise = document.querySelector('.sunrise span')
const sunSet = document.querySelector('.sunset span')
const moonRise = document.querySelector('.moonrise span')
const moonSet = document.querySelector('.moonset span')
const forecastContainer = document.querySelector('.forecast .container')
const todayContainer = document.querySelector('.today .container')

window.addEventListener('load', () => {
    let long, lat;
    navigator.geolocation.getCurrentPosition(position => {
        long = position.coords.longitude;
        lat = position.coords.latitude;
        getForecast(`https://api.weatherapi.com/v1/forecast.json?key=c357eb6071fc43e4a09225435221602&q=${lat},${long}&days=5&aqi=no&alerts=no`)
        getAstro(`https://api.weatherapi.com/v1/astronomy.json?key=c357eb6071fc43e4a09225435221602&q=${lat},${long}&dt=2022-03-16`)
        // window.setInterval(() => {
        //     getWeather(currentApi)
        // },300000)
        getWeeklyWeather(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=minutely&units=metric&appid=4749c8220ce780eb030072c3b3313ddd`)
    })
})

const render = (data) => {
    const { location: {region, country} , current: {condition: {icon, text}, temp_c, temp_f, feelslike_c, feelslike_f} } = data
    locationTimezone.textContent = `${region}, ${country}`;
    weatherIcon.style.backgroundImage = `url(https:${icon})`
    degreeNum.textContent = `${temp_c}`
    degreeType.innerHTML = "&#8451;";
    feelsLikeDegreeNum.textContent = `${feelslike_c}`
    feelsLikeDegreeType.innerHTML = "&#8451;";
    document.querySelector('.description').textContent = `${text}`
}
// gets the forecast for the day
const getForecast = async (url) => {
    let response = await fetch(url)
    let data = await response.json()
    render(data)
    renderTodayWeather(data)
}
// renders the hourly forecast for the day
const renderTodayWeather = (data) => {
    const [{hour}] = data.forecast.forecastday
    for (let i = new Date().getHours(); i < 24; i++) {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');
        const h4 = document.createElement('h4');
        h4.classList.add('hour');
        h4.textContent = `${hour[i].time.slice(-5)}`
        const img = document.createElement('img')
        img.classList.add('icon')
        img.setAttribute('src', `https://${hour[i].condition.icon}`)
        const p = document.createElement('p')
        p.classList.add('degree')
        p.innerHTML = `${hour[i].temp_c} &#8451;`

        cardDiv.appendChild(h4)
        cardDiv.appendChild(img)
        cardDiv.appendChild(p)
        todayContainer.appendChild(cardDiv)
    }
    
}
// gets the astro forecast
const getAstro = async (url) => {
    let response = await fetch(url)
    let data = await response.json()
    renderAstro(data)
}
// renders the astro in the current weather section
const renderAstro = (data) => {
    const {astronomy: {astro: { sunrise, sunset, moonrise, moonset}}} = data
    sunRise.textContent = sunrise
    sunSet.textContent = sunset
    moonRise.textContent = moonrise
    moonSet.textContent = moonset
}
// gets the weekly forecast
const getWeeklyWeather = async (url) => {
    let response = await fetch(url)
    let data = await response.json()
    renderWeeklyWeather(data)
}
// renders the weekly data in the dom
const renderWeeklyWeather = (data) => {
    const {daily} = data
    for (let i = 1; i < daily.length; i++) {
        const {dt, temp: {min, max}, weather: [{description, icon, id}], moonrise, moonset, sunrise, sunset} =daily[i]
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day')
        dayDiv.appendChild(infoDiv(dt,max, min))
        dayDiv.appendChild(astroDiv(sunrise, sunset, moonrise, moonset))
        dayDiv.appendChild(imageDiv(description, icon))
        forecastContainer.appendChild(dayDiv)
    }
}
// helper function to convert unix time
const convertTime = (time) => (new Date(time * 1000).toDateString())
// creating info div to be put inside the weekly forecast days
const infoDiv = (time, maxTemp, minTemp) => {
    const infoDiv = document.createElement('div');
    infoDiv.classList.add('info')

    const heading = document.createElement('h3');
    heading.classList.add('day-name')
    heading.textContent = `${convertTime(time)}`

    const tempDiv = document.createElement('div')
    tempDiv.classList.add('temp')

    const maxDegreeHeading = document.createElement('h4')
    maxDegreeHeading.classList.add('max-degree')
    maxDegreeHeading.innerHTML = `${maxTemp}&#8451;`

    const minDegreeHeading = document.createElement('h4')
    minDegreeHeading.classList.add('min-degree')
    minDegreeHeading.innerHTML = `${minTemp}&#8451;`

    tempDiv.appendChild(maxDegreeHeading)
    tempDiv.appendChild(minDegreeHeading)

    infoDiv.appendChild(heading)
    infoDiv.appendChild(tempDiv)

    return infoDiv
}
// creating astro div to be put inside the weekly forecast days
const astroDiv = (...time) => {
    const astroDiv = document.createElement('div')
    astroDiv.classList.add('astro')
    const astroArray = ["Sunrise", "Sunset", "Moonrise", "Moonset"]
    astroArray.forEach((item, index) => {
        const div = document.createElement('div')
        div.classList.add(item.toLowerCase())
        const p = document.createElement('p')
        p.textContent = item
        const timeP = document.createElement('p')
        timeP.textContent = `${new Date(time[index] * 1000).getHours() > 12 ? new Date(time[index] * 1000).getHours() - 12 : new Date(time[index] * 1000).getHours()}:${new Date(time[index] * 1000).getMinutes() > 9 ? new Date(time[index] * 1000).getMinutes() : `0${new Date(time[index] * 1000).getMinutes()}`} ${new Date(time[index] * 1000).toLocaleTimeString().slice(-2)}`
        div.appendChild(p)
        div.appendChild(timeP)
        astroDiv.appendChild(div)
    })
    return astroDiv;
}
// creating image div to be put inside weekly forecast days
const imageDiv = (description, icon) => {
    const imageDiv = document.createElement('div')
    imageDiv.classList.add('image')
    const iconImg = document.createElement('img')
    iconImg.classList.add('icon')
    iconImg.setAttribute('src', `https://openweathermap.org/img/wn/${icon}@2x.png`)
    const descriptionP = document.createElement('p')
    descriptionP.classList.add('description')
    descriptionP.textContent = description
    imageDiv.appendChild(iconImg)
    imageDiv.appendChild(descriptionP)
    return imageDiv;
}

// degreeSec.addEventListener('click', () => {
    //     if (degreeNum.textContent === `${temp_c}`) {
    //         degreeNum.innerHTML = `${temp_f}`
    //         degreeType.innerHTML = "&#8457;";
    //         feelsLikeDegreeNum.innerHTML = `${feelslike_f}`
    //         feelsLikeDegreeType.innerHTML = "&#8457;";
    //     } else {
    //         degreeNum.innerHTML = `${temp_c}`
    //         degreeType.innerHTML = "&#8451;";
    //         feelsLikeDegreeNum.innerHTML = `${feelslike_c}`
    //         feelsLikeDegreeType.innerHTML = "&#8451;";
    //     }
    // })