const postId = new URLSearchParams(window.location.search).get('id');
const contentContainer = document.getElementById('postContent');
const titleElement = document.getElementById('postTitle');
const metaElement = document.getElementById('postMeta');
const likeButton = document.getElementById('likeButton');
const likeCount = document.getElementById('likeCount');
const viewCount = document.getElementById('viewCount');
const shareButton = document.getElementById('shareButton');
const kakaoButton = document.getElementById('kakaoButton');
const editButton = document.getElementById('editButton');

async function fetchPost() {
  if (!postId) {
    contentContainer.innerHTML = '<p class="text-slate-500">잘못된 게시글입니다.</p>';
    return;
  }
  const response = await fetch(`/api/posts/${postId}`);
  if (!response.ok) {
    contentContainer.innerHTML = '<p class="text-slate-500">게시글을 찾을 수 없습니다.</p>';
    return;
  }
  const post = await response.json();
  titleElement.textContent = post.title;
  metaElement.textContent = `${post.category} · ${post.author} · ${new Date(post.createdAt).toLocaleString('ko-KR')}`;
  document.getElementById('postCategory').textContent = post.category;
  likeCount.textContent = post.likes;
  viewCount.textContent = post.views;
  contentContainer.innerHTML = `<p class="mb-4 leading-relaxed text-slate-700">${post.content.replace(/\n/g, '<br>')}</p>`;
}

async function incrementView() {
  if (!postId) return;
  const response = await fetch(`/api/posts/${postId}/view`, { method: 'POST' });
  if (response.ok) {
    const result = await response.json();
    viewCount.textContent = result.views;
  }
}

async function likePost() {
  if (!postId) return;
  const response = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
  if (!response.ok) return;
  const result = await response.json();
  likeCount.textContent = result.likes;
  showToast('좋아요를 눌렀습니다!');
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    showToast('게시글 링크가 복사되었습니다.');
  } catch (error) {
    showToast('링크 복사에 실패했습니다. 다시 시도해주세요.');
  }
}

function goToEdit() {
  if (!postId) return;
  window.location.href = `write.html?id=${postId}`;
}

function kakaoPlaceholder() {
  showToast('카카오톡 공유는 추후에 추가될 예정입니다.');
}

window.addEventListener('DOMContentLoaded', () => {
  fetchPost().then(incrementView);
  if (likeButton) likeButton.addEventListener('click', likePost);
  if (shareButton) shareButton.addEventListener('click', copyLink);
  if (kakaoButton) kakaoButton.addEventListener('click', kakaoPlaceholder);
  if (editButton) editButton.addEventListener('click', goToEdit);
});
