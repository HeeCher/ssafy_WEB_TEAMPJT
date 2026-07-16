const spotId = new URLSearchParams(window.location.search).get('id');

const titleEl = document.getElementById('spotTitle');
const categoryEl = document.getElementById('spotCategory');
const addressEl = document.getElementById('spotAddress');
const telEl = document.getElementById('spotTel');
const addrEl = document.getElementById('spotAddr');
const featureList = document.getElementById('featureList');
const stationList = document.getElementById('stationList');
const restaurantList = document.getElementById('restaurantList');
const carouselImages = document.getElementById('carouselImages');
const carouselPrev = document.getElementById('carouselPrev');
const carouselNext = document.getElementById('carouselNext');
const spotMap = document.getElementById('spotMap');

let currentIndex = 0;
let photos = [];

function renderCarousel() {
  carouselImages.innerHTML = photos
    .map(photo => `
      <div class="min-w-full snap-center">
        <img src="${photo}" alt="spot photo" class="w-full h-[420px] object-cover">
      </div>
    `)
    .join('');

  const scrollLeft = currentIndex * carouselImages.clientWidth;
  carouselImages.scrollTo({ left: scrollLeft, behavior: 'smooth' });
}

function moveCarousel(direction) {
  if (!photos.length) return;
  currentIndex = (currentIndex + direction + photos.length) % photos.length;
  renderCarousel();
}

function renderList(container, items, renderItem) {
  container.innerHTML = items.map(renderItem).join('');
}

async function loadSpot() {
  if (!spotId) {
    titleEl.textContent = '잘못된 스팟입니다.';
    return;
  }

  const response = await fetch(`/api/seoul-spots/${spotId}`);
  if (!response.ok) {
    titleEl.textContent = '스팟을 찾을 수 없습니다.';
    return;
  }

  const spot = await response.json();

  titleEl.textContent = spot.title;
  categoryEl.textContent = spot.category;
  addressEl.textContent = spot.address;
  telEl.textContent = spot.tel;
  addrEl.textContent = spot.address;

  photos = spot.photos;
  renderCarousel();

  renderList(featureList, spot.features, feature => `
    <li class="flex items-start gap-3">
      <span class="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-primary"></span>
      <span class="text-slate-600">${feature}</span>
    </li>
  `);

  renderList(stationList, spot.nearbyStations, station => `
    <div class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <h3 class="font-semibold text-slate-900">${station.name}</h3>
      <p class="text-slate-500 text-sm">${station.line} · ${station.distance}</p>
    </div>
  `);

  renderList(restaurantList, spot.nearbyRestaurants, resto => `
    <div class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <h3 class="font-semibold text-slate-900">${resto.name}</h3>
      <p class="text-slate-500 text-sm">${resto.desc}</p>
    </div>
  `);

  const mapx = encodeURIComponent(spot.mapx);
  const mapy = encodeURIComponent(spot.mapy);
  spotMap.src = `https://maps.google.com/maps?q=${mapy},${mapx}&z=15&output=embed`;
}

window.addEventListener('DOMContentLoaded', () => {
  loadSpot();
  if (carouselPrev) carouselPrev.addEventListener('click', () => moveCarousel(-1));
  if (carouselNext) carouselNext.addEventListener('click', () => moveCarousel(1));
});