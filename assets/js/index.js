const weatherCard = document.getElementById('weatherCard');
const spotList = document.getElementById('spotList');

async function loadWeather() {
  try {
    const response = await fetch('/api/weather');
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Weather load failed');
    document.getElementById('weatherTitle').textContent = `${data.city}, ${data.summary}`;
    document.getElementById('weatherDetail').textContent = `현재 온도 ${data.temperature.toFixed(1)}°C · 바람 ${data.windspeed.toFixed(1)}m/s`;
    document.getElementById('weatherTag').textContent = `${data.summary}에 어울리는 서울 스팟 추천`; 
  } catch (error) {
    weatherCard.innerHTML = '<p class="text-slate-500">날씨 정보를 불러오는 중 오류가 발생했습니다.</p>';
  }
}

async function loadSpots() {
  try {
    const response = await fetch('/api/seoul-spots?limit=4');
    const spots = await response.json();
    spotList.innerHTML = spots.map(spot => `
      <article class="min-w-[240px] rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition duration-300 bg-white">
        <img src="${spot.image}" alt="${spot.title}" class="w-full h-40 object-cover">
        <div class="p-4">
          <h3 class="font-bold text-slate-900 mb-2">${spot.title}</h3>
          <p class="text-xs text-slate-500 mb-3 line-clamp-2">${spot.address}</p>
          <span class="inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-600 text-xs py-1 px-3">${spot.category}</span>
        </div>
      </article>
    `).join('');
  } catch (error) {
    spotList.innerHTML = '<p class="text-slate-500">서울 추천 스팟을 불러오지 못했습니다.</p>';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  loadWeather();
  loadSpots();
});
