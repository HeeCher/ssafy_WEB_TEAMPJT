const boardList = document.getElementById('boardList');
const spotSection = document.getElementById('spotSection');
const spotList = document.getElementById('spotList');
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const noResult = document.getElementById('noResult');

const categories = ['맛집탐방', '동네질문', '축제/행사', '가볼만한곳'];

function buildPostCard(post) {
  return `
    <a href="post.html?id=${post.id}" class="block bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-2xl transition duration-300 overflow-hidden">
      <div class="p-6">
        <div class="flex justify-between items-start mb-4">
          <span class="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-full">${post.category}</span>
          <span class="text-xs text-slate-400">${new Date(post.createdAt).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <h3 class="font-bold text-xl text-slate-900 mb-3 line-clamp-2">${post.title}</h3>
        <p class="text-slate-500 text-sm mb-5 line-clamp-3">${post.excerpt}</p>
        <div class="flex items-center justify-between text-xs text-slate-500">
          <span>${post.author}</span>
          <span class="flex items-center gap-2"><i class="ph-fill ph-heart text-red-500"></i>${post.likes}</span>
        </div>
      </div>
    </a>
  `;
}

function buildSpotCard(spot) {
  return `
    <article class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl transition duration-300">
      <img src="${spot.image}" alt="${spot.title}" class="w-full h-44 object-cover">
      <div class="p-5">
        <h3 class="font-bold text-lg text-slate-900 mb-2">${spot.title}</h3>
        <p class="text-slate-500 text-sm mb-3 line-clamp-2">${spot.address}</p>
        <span class="inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-600 text-xs py-1 px-3">${spot.category}</span>
      </div>
    </article>
  `;
}

async function loadPosts() {
  const query = searchInput.value.trim();
  const category = categorySelect.value;
  const params = new URLSearchParams();
  if (query) params.set('search', query);
  if (category && category !== '전체' && category !== '가볼만한곳') params.set('category', category);

  if (category === '가볼만한곳') {
    if (spotSection) spotSection.classList.remove('hidden');
    boardList.innerHTML = '';
    noResult.textContent = '';
    loadSpots();
    return;
  }

  if (spotSection) spotSection.classList.add('hidden');

  const response = await fetch(`/api/posts?${params.toString()}`);
  const posts = await response.json();

  if (!posts.length) {
    boardList.innerHTML = '';
    noResult.textContent = '조건에 해당하는 게시글이 없습니다. 검색어를 바꿔보세요.';
    return;
  }

  boardList.innerHTML = posts.map(buildPostCard).join('');
  noResult.textContent = '';
}

async function loadSpots() {
  try {
    const response = await fetch('/api/seoul-spots?limit=6');
    const spots = await response.json();
    spotList.innerHTML = spots.map(buildSpotCard).join('');
  } catch (error) {
    spotList.innerHTML = '<p class="text-slate-500">가볼만한곳 데이터를 불러오지 못했습니다.</p>';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  const initialCategory = new URLSearchParams(window.location.search).get('category');
  if (initialCategory && categories.includes(initialCategory)) {
    categorySelect.value = initialCategory;
  } else {
    categorySelect.value = '전체';
  }

  document.getElementById('boardSearchForm').addEventListener('submit', event => {
    event.preventDefault();
    loadPosts();
  });

  categorySelect.addEventListener('change', loadPosts);
  loadPosts();
});
