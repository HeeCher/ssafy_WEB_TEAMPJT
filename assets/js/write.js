const writeForm = document.getElementById('writeForm');

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

  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, category, tags, content })
  });

  if (!response.ok) {
    const error = await response.json();
    showToast(error.error || '게시글 작성에 실패했습니다.');
    return;
  }

  const post = await response.json();
  showToast('게시글이 등록되었습니다. 상세 페이지로 이동합니다.');
  window.location.href = `post.html?id=${post.id}`;
}

window.addEventListener('DOMContentLoaded', () => {
  if (writeForm) writeForm.addEventListener('submit', submitPost);
});
