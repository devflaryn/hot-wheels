async function save(year, index, status) {
    let data = await window.Bridge.load();

    if (!data || typeof data !== 'object') {data = {}}
    if (!data[year]) {data[year] = {};}
    if (!data[year][index]) {data[year][index] = {}}

    data[year][index].status = status

    await window.Bridge.save(data)
}

async function load(year, index) {
    let data = await window.Bridge.load()
    try {
        const yearKey = String(year)

        if (data.hasOwnProperty(yearKey)) {
            const yearData = data[yearKey]

            if (yearData.hasOwnProperty(index)) {
                return {
                    status: yearData[index].status
                }
            }
        }

        return { status: 0 };
    } catch (err) {
        console.error('Error loading data:', err);
        return { status: 0 };
    }
}

/*
load(2024, '001b').then(result => console.log(result));
load(2024, '001c').then(result => console.log(result));
*/
