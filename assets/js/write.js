const writeForm = document.getElementById('writeForm');
const postId = new URLSearchParams(window.location.search).get('id');
const pageTitle = document.getElementById('pageTitle');
const submitButton = document.getElementById('submitButton');

async function loadPostForEdit() {
  if (!postId) return;
  const response = await fetch(`/api/posts/${postId}`);
  if (!response.ok) return;
  const post = await response.json();
  writeForm.title.value = post.title;
  writeForm.category.value = post.category;
  writeForm.tags.value = post.tags.join(', ');
  writeForm.content.value = post.content;
  if (pageTitle) pageTitle.textContent = '게시글 수정';
  if (submitButton) submitButton.textContent = '수정하기';
}

async function submitPost(event) {
  event.preventDefault();
  const formData = new FormData(writeForm);
  const title = formData.get('title').toString().trim();
  const category = formData.get('category').toString();
  const tags = formData.get('tags').toString();
  const content = formData.get('content').toString().trim();

  if (!title || !content) {
    showToast('제목과 내용은 모두 입력해주세요.');
    return;
  }

  const url = postId ? `/api/posts/${postId}` : '/api/posts';
  const method = postId ? 'PUT' : 'POST';

  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, category, tags, content })
  });

  if (!response.ok) {
    const error = await response.json();
    showToast(error.error || '게시글 저장에 실패했습니다.');
    return;
  }

  const post = await response.json();
  showToast(postId ? '게시글이 수정되었습니다.' : '게시글이 등록되었습니다.');
  window.location.href = `post.html?id=${post.id}`;
}

window.addEventListener('DOMContentLoaded', () => {
  if (writeForm) {
    writeForm.addEventListener('submit', submitPost);
    loadPostForEdit();
  }
});