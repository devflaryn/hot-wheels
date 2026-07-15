const others = document.querySelector('.others')

let lastLoaded = 1

const createBar = (year, index) => {
    const format = index.toString().padStart(3, '0');

    const newResultContainer = document.createElement('div');
    newResultContainer.className = 'others-car'
    newResultContainer.innerHTML = ''

    const yearE = cars.find(entry => entry.year === year);
    if (yearE) {
        for(let i = 0; i < yearE.cars.filter(car => car.index === format).length; i++) {
            let car = yearE.cars.filter(car => car.index === format)
            let innerResult = document.createElement('div')
            innerResult.className = 'others-color'
            innerResult.id = format + String.fromCharCode(97 + i)

            load(year, format + String.fromCharCode(97 + i)).then(result => {
                if (result.status == 1) {
                    innerResult.classList.add('owned')
                } else if (result.status == 0) {
                    innerResult.classList.add('notowned')
                } else if (result.status == 2) {
                    innerResult.classList.add('damaged')
                }
            });

            innerResult.innerHTML = `
                <div class='others-text'>
                    <p class='others-index'>${index}/250</p>
                    <div class='others-center-text'>
                        <p class='others-group-title'>${car[i].group_title}</p>
                        <p class='others-car-model'>${car[i].model_name}</p>
                    </div>
                    <p class='others-serial'>${car[i].serial}</p>
                </div>
            `
            newResultContainer.appendChild(innerResult)
        }

        others.appendChild(newResultContainer)
    }
}

const updateOthers = (index, status) => {
    const id = index;
    const element = document.getElementById(id);

    if (element) {
        element.className = 'others-color'
        switch (status) {
            case 0:
                element.classList.add('notowned')
                break;
            case 1:
                element.classList.add('owned')
                break;
            case 2:
                element.classList.add('damaged')
                break;
            default:
                console.warn(`Unknown status: ${status}`);
        }
        return true;
    } else {
        return false;
    }
};

const loadNew = (count) => {
    for (let i = 0; i < count; i++) {
        createBar(selected_year, lastLoaded)
        lastLoaded += 1
    }
}

loadNew(25)

window.addEventListener('scroll', async () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    if (scrollTop + clientHeight >= scrollHeight - 10) {
        loadNew(25)
    }
});

const refreshOthers = () => { 
    lastLoaded = 1
    others.innerHTML = ''
    loadNew(25)
}

