function find_car(index, year) {
    const yearData = cars.find(item => item.year === year);

    if (yearData) {
        return yearData.cars.filter(car => car.index === index);
    }

    return [];
}