const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;
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

app.put('/api/posts/:id', async (req, res) => {
  const db = await ensureDb();
  const post = db.posts.find(p => p.id === Number(req.params.id));
  if (!post) {
    return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
  }

  const { title, category, content, tags } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: '제목과 내용은 필수입니다.' });
  }

  post.title = title.toString().trim();
  post.category = category ? category.toString().trim() : post.category;
  post.content = content.toString().trim();
  post.excerpt = content.toString().trim().slice(0, 160);
  post.tags = Array.isArray(tags)
    ? tags.map(tag => tag.toString().trim()).filter(Boolean)
    : typeof tags === 'string' && tags.length
      ? tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : post.tags;

  await writeJson(DB_FILE, db);
  res.json(post);
});

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

app.get('/api/weather', async (req, res) => {
  try {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current_weather=true&timezone=Asia/Seoul';
    const response = await fetch(url);
    const data = await response.json();
    if (!data.current_weather) {
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
    res.status(500).json({ error: '기상 API 호출 중 오류가 발생했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
