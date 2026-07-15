const years = new Set();

cars.forEach(item => {
    years.add(item.year);
});

const yearsArray = Array.from(years).sort((a, b) => a - b);

const container = document.querySelector('.years');

let selected_year = yearsArray[yearsArray.length - 1];

yearsArray.forEach((year, index) => {
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.id = year;
    radio.name = 'year';
    radio.value = year;

    if (index === yearsArray.length - 1) {
        radio.checked = true;
    }

    const label = document.createElement('label');
    label.htmlFor = year;
    label.textContent = year;

    radio.addEventListener('input', () => {
        selected_year = year;
        console.log('Selected year:', selected_year);
        process()
        refreshOthers()
        //loadOthers(year)
    });

    container.appendChild(radio);
    container.appendChild(label);
});
