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

  const restaurantTypes = [
    {
      label: '주변 한식',
      query: '한식',
      photo: 'assets/images/hansik.png',
      desc: '비빔밥, 된장찌개 등 한식 맛집 검색'
    },
    {
      label: '주변 양식',
      query: '양식',
      photo: 'assets/images/pasta.png',
      desc: '파스타, 스테이크 등 양식 맛집 검색'
    },
    {
      label: '주변 일식',
      query: '일식',
      photo: 'assets/images/sushi.png',
      desc: '스시 등 일식 맛집 검색'
    }
  ];

  const restaurantSearchItems = restaurantTypes.map(type => {
    const keyword = `${spot.address} 주변 ${type.query}`;
    return {
      name: type.label,
      desc: `${spot.address} 주변 ${type.query} 맛집 검색`,
      photo: type.photo,
      naverLink: `https://search.naver.com/search.naver?query=${encodeURIComponent(keyword)}`
    };
  });

  renderList(restaurantList, restaurantSearchItems, resto => `
    <article class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <img src="${resto.photo}"
           alt="${resto.name} 대표 이미지"
           class="w-full h-44 object-cover">
      <div class="p-4">
        <h3 class="font-semibold text-slate-900 mb-2">${resto.name}</h3>
        <p class="text-slate-500 text-sm mb-3">${resto.desc}</p>
        <a href="${resto.naverLink}"
           target="_blank"
           rel="noopener noreferrer"
           class="inline-flex items-center justify-center w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-blue-600 transition">
          네이버에서 보기
        </a>
      </div>
    </article>
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