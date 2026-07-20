// Catalog artwork bundled from frontend/assets/cars/<year>/*.png.
// The glob matches every year folder present at build time, so adding a new
// year is just dropping a folder of images — no code change needed.
const images = import.meta.glob('../../assets/cars/*/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

// Series (class) title artwork, one per series: assets/cars/classes/<slug>.png
const classImages = import.meta.glob('../../assets/cars/classes/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

const seriesSlug = (series) => series.toLowerCase().replaceAll(':', '').replace(/ /g, '_');

// Filename formula: series lowercased with spaces as underscores, suffixed
// with (position in series - 1). "HW Xtreme Sports" 3/10 → hw_xtreme_sports_2.png
export function carImageUrl(car) {
  if (!car?.series || !car?.year) return null;
  const pos = parseInt(car.seriesPosition, 10);
  if (!Number.isFinite(pos) || pos < 1) return null;
  return images[`../../assets/cars/${car.year}/${seriesSlug(car.series)}_${pos - 1}.png`] || null;
}

// "HW Xtreme Sports" → assets/cars/classes/hw_xtreme_sports.png
export function classImageUrl(car) {
  if (!car?.series) return null;
  return classImages[`../../assets/cars/classes/${seriesSlug(car.series)}.png`] || null;
}
