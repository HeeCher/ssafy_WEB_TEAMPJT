const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');
const SPOTS_FILE = path.join(__dirname, 'data', 'seoul_spots.json');

const seedPosts = [
  {
    id: 1,
    title: '신당동 떡볶이 타운 숨은 맛집 찾았음!!',
    category: '맛집탐방',
    content: '매일 유명한 곳만 가다가 골목 안쪽에 있는 작은 가게 들어갔는데 진짜 인생 떡볶이네요. 야끼만두 꼭 추가하세요. 분위기도 좋고 가격도 합리적이었습니다.',
    excerpt: '매일 유명한 곳만 가다가 골목 안쪽에 있는 작은 가게 들어갔는데 진짜 인생 떡볶이네요.',
    author: '익명 124',
    createdAt: '2026-07-15T10:05:00.000Z',
    likes: 24,
    views: 120,
    tags: ['맛집', '떡볶이']
  },
  {
    id: 2,
    title: '마포구쪽 야간 러닝 코스 추천좀요',
    category: '동네질문',
    content: '요즘 저녁에 선선해서 뛰고 싶은데 한강공원쪽 말고 가로등 밝고 사람 적당히 있는 코스 있을까요? 가볼만한 곳과 맛집도 함께 알려주시면 감사해요.',
    excerpt: '요즘 저녁에 선선해서 뛰고 싶은데 한강공원쪽 말고 가로등 밝고 사람 적당히 있는 코스 있을까요?',
    author: '익명 89',
    createdAt: '2026-07-15T09:20:00.000Z',
    likes: 2,
    views: 82,
    tags: ['러닝', '야간']
  },
  {
    id: 3,
    title: '이번주 광화문 야시장 오픈! 🌃',
    category: '축제/행사',
    content: '푸드트럭 라인업 떴네요! 금토일 18시부터 한다고 하니 가실 분들 참고하세요. 사람 엄청 많을듯 하니 일찍 가는 걸 추천드려요.',
    excerpt: '푸드트럭 라인업 떴네요! 금토일 18시부터 한다고 하니 가실 분들 참고하세요.',
    author: '익명 412',
    createdAt: '2026-07-15T08:10:00.000Z',
    likes: 89,
    views: 230,
    tags: ['야시장', '축제']
  },
  {
    id: 4,
    title: '가을에 가기 좋은 서울 가볼만한곳 추천',
    category: '가볼만한곳',
    content: '서울숲, 양화한강공원, 북촌 8경을 추천합니다. 사진 찍기 좋고 주말 나들이로 딱이에요.',
    excerpt: '서울숲, 양화한강공원, 북촌 8경을 추천합니다.',
    author: '익명 78',
    createdAt: '2026-07-14T22:05:00.000Z',
    likes: 56,
    views: 164,
    tags: ['가을', '나들이']
  }
];

const seedDb = {
  nextId: 5,
  posts: seedPosts
};

async function readJson(filePath) {
  try {
    const text = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

async function writeJson(filePath, data) {
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

async function ensureDb() {
  let db = await readJson(DB_FILE);
  if (!db || !Array.isArray(db.posts)) {
    await writeJson(DB_FILE, seedDb);
    return seedDb;
  }
  if (typeof db.nextId !== 'number') {
    db.nextId = db.posts.reduce((max, post) => Math.max(max, post.id), 0) + 1;
  }
  return db;
}

function weatherDescription(code) {
  const map = {
    0: '맑음',
    1: '대체로 맑음',
    2: '구름 조금',
    3: '흐림',
    45: '안개',
    48: '안개',
    51: '약한 이슬비',
    53: '보통 비',
    55: '강한 이슬비',
    61: '비',
    63: '보통 비',
    65: '강한 비',
    71: '눈',
    73: '보통 눈',
    75: '강한 눈',
    80: '약한 소나기',
    81: '소나기',
    82: '강한 소나기',
    95: '뇌우',
    96: '우박',
    99: '우박'
  };
  return map[code] || '맑음';
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, '.')));

app.get('/api/posts', async (req, res) => {
  const search = (req.query.search || '').toString().trim().toLowerCase();
  const category = (req.query.category || '').toString().trim();
  const db = await ensureDb();
  let posts = [...db.posts];

  if (category && category !== '전체' && category !== '가볼만한곳') {
    posts = posts.filter(post => post.category === category);
  }

  if (search) {
    posts = posts.filter(post => {
      const text = `${post.title} ${post.content} ${post.tags.join(' ')}`.toLowerCase();
      return text.includes(search);
    });
  }

  posts.sort((a, b) => b.likes - a.likes || b.views - a.views);
  res.json(posts);
});

app.get('/api/posts/:id', async (req, res) => {
  const db = await ensureDb();
  const post = db.posts.find(p => p.id === Number(req.params.id));
  if (!post) {
    return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
  }
  res.json(post);
});

app.post('/api/posts', async (req, res) => {
  const db = await ensureDb();
  const { title, category, content, tags } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: '제목과 내용은 필수입니다.' });
  }
  const newPost = {
    id: db.nextId++,
    title: title.toString().trim(),
    category: category ? category.toString().trim() : '동네질문',
    content: content.toString().trim(),
    excerpt: content.toString().trim().slice(0, 160),
    author: '익명',
    createdAt: new Date().toISOString(),
    likes: 0,
    views: 0,
    tags: Array.isArray(tags)
      ? tags.map(tag => tag.toString().trim()).filter(Boolean)
      : typeof tags === 'string' && tags.length
      ? tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : []
  };

  db.posts.unshift(newPost);
  await writeJson(DB_FILE, db);
  res.status(201).json(newPost);
});

app.post('/api/posts/:id/like', async (req, res) => {
  const db = await ensureDb();
  const post = db.posts.find(p => p.id === Number(req.params.id));
  if (!post) {
    return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
  }
  post.likes += 1;
  await writeJson(DB_FILE, db);
  res.json({ likes: post.likes });
});

app.post('/api/posts/:id/view', async (req, res) => {
  const db = await ensureDb();
  const post = db.posts.find(p => p.id === Number(req.params.id));
  if (!post) {
    return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
  }
  post.views += 1;
  await writeJson(DB_FILE, db);
  res.json({ views: post.views });
});

app.get('/api/seoul-spots', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 4, 12);
  const spotsData = await readJson(SPOTS_FILE);
  if (!spotsData || !Array.isArray(spotsData.items)) {
    return res.status(500).json({ error: '서울 데이터 로드에 실패했습니다.' });
  }
  const picks = spotsData.items
    .filter(item => item.firstimage)
    .sort(() => 0.5 - Math.random())
    .slice(0, limit)
    .map(item => ({
      id: item.contentid,
      title: item.title,
      image: item.firstimage,
      address: item.addr1,
      category: item.cat3 || item.cat2 || item.cat1 || '서울 가볼만한곳'
    }));
  res.json(picks);
});

app.get('/api/seoul-spots/:id', async (req, res) => {
  const spotsData = await readJson(SPOTS_FILE);
  if (!spotsData || !Array.isArray(spotsData.items)) {
    return res.status(500).json({ error: '서울 데이터 로드에 실패했습니다.' });
  }

  const spot = spotsData.items.find(item => item.contentid === req.params.id);
  if (!spot) {
    return res.status(404).json({ error: '스팟을 찾을 수 없습니다.' });
  }

  const photos = [spot.firstimage, spot.firstimage2, spot.firstimage]
    .filter(Boolean)
    .slice(0, 3);

  while (photos.length < 3) {
    photos.push(photos[0] || 'https://via.placeholder.com/800x500?text=No+Image');
  }

  const locationInfo = [
    {
      key: '강동구',
      stations: [
        { name: '둔촌오륜역', line: '5호선', distance: '1.1km' },
        { name: '강동역', line: '5호선', distance: '1.4km' }
      ],
      restaurants: [
  {
    name: '둔촌역 감자탕',
    desc: '든든한 한식 국물 맛집',
    photo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    naverLink: 'https://search.naver.com/search.naver?query=둔촌역+감자탕',
    reviews: '3,200'
  },
  {
    name: '강동역 카페 75',
    desc: '브런치와 디저트 추천',
    photo: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80',
    naverLink: 'https://search.naver.com/search.naver?query=강동역+카페+75',
    reviews: '2,100'
  },
  {
    name: '둔촌역 분식',
    desc: '가성비 떡볶이 전문점',
    photo: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80',
    naverLink: 'https://search.naver.com/search.naver?query=둔촌역+분식',
    reviews: '1,870'
  }
]
    },
    {
      key: '종로구',
      stations: [
        { name: '종각역', line: '1호선', distance: '900m' },
        { name: '안국역', line: '3호선', distance: '1.3km' }
      ],
      restaurants: [
        { name: '종각 떡볶이', desc: '매콤달콤 즉석 떡볶이' },
        { name: '광화문 김밥', desc: '간편하고 인기 많은 분식집' },
        { name: '인사동 찻집', desc: '전통 다과와 분위기 좋은 카페' }
      ]
    },
    {
      key: '성동구',
      stations: [
        { name: '뚝섬역', line: '2호선', distance: '750m' },
        { name: '성수역', line: '2호선', distance: '1.8km' }
      ],
      restaurants: [
        { name: '뚝섬 파스타', desc: '데이트하기 좋은 이탈리안' },
        { name: '서울숲 분식', desc: '가볍게 즐기는 한끼' },
        { name: '카페 포레스트', desc: '도심 속 힐링 카페' }
      ]
    }
  ];

  const matched = locationInfo.find(item => spot.addr1.includes(item.key));
  const nearbyStations = matched?.stations || [
    { name: '서울역', line: '1호선', distance: '2.0km' }
  ];
  const nearbyRestaurants = matched?.restaurants || [
    { name: '서울 맛집 A', desc: '대표 추천 맛집입니다.' },
    { name: '서울 맛집 B', desc: '인기 메뉴를 경험해보세요.' },
    { name: '서울 맛집 C', desc: '가볍게 들르기 좋은 식당.' }
  ];

  res.json({
    id: spot.contentid,
    title: spot.title,
    address: spot.addr1,
    category: spot.cat3 || spot.cat2 || spot.cat1 || '서울 가볼만한곳',
    tel: spot.tel || '정보 없음',
    photos,
    mapx: spot.mapx,
    mapy: spot.mapy,
    features: [
      `${spot.title}은(는) ${spot.addr1}에 위치한 인기 명소입니다.`,
      '사진 찍기 좋은 포토 스팟과 산책로가 잘 조성되어 있습니다.',
      '가족 나들이, 연인 데이트, 친구들과 함께하기 좋은 장소입니다.'
    ],
    nearbyStations,
    nearbyRestaurants
  });
});

app.get('/api/weather', async (req, res) => {
  try {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current_weather=true&timezone=Asia/Seoul';
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Weather API response error:', response.status, errorText);
      return res.status(502).json({ error: '기상 정보를 가져오는 데 실패했습니다.' });
    }

    const data = await response.json();
    if (!data?.current_weather) {
      console.error('Weather API returned invalid data:', data);
      return res.status(502).json({ error: '기상 정보를 가져오는 데 실패했습니다.' });
    }

    res.json({
      city: '서울',
      temperature: data.current_weather.temperature,
      windspeed: data.current_weather.windspeed,
      time: data.current_weather.time,
      weatherCode: data.current_weather.weathercode,
      summary: weatherDescription(data.current_weather.weathercode)
    });
  } catch (error) {
    console.error('Weather API 호출 중 오류:', error);
    res.status(500).json({ error: '기상 API 호출 중 오류가 발생했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
