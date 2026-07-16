const spotList = document.getElementById('spotList');

async function loadSpots() {
  try {
    const response = await fetch('/api/seoul-spots?limit=12');
    const spots = await response.json();
    spotList.innerHTML = spots.map(spot => `
      <article class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl transition duration-300">
        <img src="${spot.image}" alt="${spot.title}" class="w-full h-44 object-cover">
        <div class="p-5">
          <h3 class="font-bold text-lg text-slate-900 mb-2">${spot.title}</h3>
          <p class="text-slate-500 text-sm mb-3 line-clamp-2">${spot.address}</p>
          <span class="inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-600 text-xs py-1 px-3">${spot.category}</span>
        </div>
      </article>
    `).join('');
  } catch (error) {
    spotList.innerHTML = '<p class="text-slate-500">가볼만한곳 데이터를 불러오지 못했습니다.</p>';
  }
}

window.addEventListener('DOMContentLoaded', loadSpots);
