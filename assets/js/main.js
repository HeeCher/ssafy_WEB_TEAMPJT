function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium flex items-center gap-3 opacity-0 translate-y-3 transition duration-300';
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => {
        toast.classList.remove('opacity-0', 'translate-y-3');
    });
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-3');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 2400);
}

let isChatOpen = false;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

function toggleChatbot() {
    const chatbot = document.getElementById('chatbotWindow');
    if (!chatbot) return;
    isChatOpen = !isChatOpen;
    chatbot.classList.toggle('scale-95', !isChatOpen);
    chatbot.classList.toggle('opacity-0', !isChatOpen);
    chatbot.classList.toggle('pointer-events-none', !isChatOpen);
}

function getChatAnswer(message) {
    const text = message.toLowerCase();
    if (text.includes('날씨') || text.includes('기온') || text.includes('서울 날씨')) {
        return '서울 날씨는 메인에서 현재 정보로 확인할 수 있어요. 오늘은 맑은 날씨라면 한강 산책도 추천합니다.';
    }
    if (text.includes('가볼만한곳') || text.includes('추천') || text.includes('여행')) {
        return '서울 가볼만한 곳은 서울숲, 양화한강공원, 북촌 8경 등이 있어요. 게시판의 "가볼만한곳" 카테고리에서도 더 많은 추천을 볼 수 있습니다.';
    }
    if (text.includes('게시글') || text.includes('글쓰기') || text.includes('작성')) {
        return '게시글 작성은 상단의 글쓰기 버튼을 눌러 새로운 글을 등록하고, 등록 후 상세 페이지로 바로 이동할 수 있습니다.';
    }
    return '궁금한 내용을 입력해 주세요. 예: "서울 가볼만한곳 추천", "오늘 날씨", "글쓰기 방법"';
}

function appendChatMessage(text, source) {
    const history = document.getElementById('chatHistory');
    if (!history) return;
    const bubble = document.createElement('div');
    bubble.className = source === 'user'
        ? 'self-end bg-blue-600 text-white rounded-3xl px-4 py-3 max-w-[80%] text-sm'
        : 'self-start bg-slate-100 text-slate-800 rounded-3xl px-4 py-3 max-w-[80%] text-sm';
    bubble.textContent = text;
    history.appendChild(bubble);
    history.scrollTop = history.scrollHeight;
}

function handleChatSubmit(event) {
    event.preventDefault();
    const input = document.getElementById('chatInput');
    if (!input) return;
    const message = input.value.trim();
    if (!message) return;
    appendChatMessage(message, 'user');
    input.value = '';
    const answer = getChatAnswer(message);
    setTimeout(() => appendChatMessage(answer, 'bot'), 250);
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (!menu) return;
    menu.classList.toggle('hidden');
}

function onChatbotDragStart(event) {
    const chatbot = document.getElementById('chatbotWindow');
    if (!chatbot) return;

    event.preventDefault();
    isDragging = true;

    const rect = chatbot.getBoundingClientRect();
    dragOffsetX = event.clientX - rect.left;
    dragOffsetY = event.clientY - rect.top;

    chatbot.style.right = 'auto';
    chatbot.style.bottom = 'auto';
    chatbot.style.zIndex = '9999';

    window.addEventListener('pointermove', onChatbotDragMove);
    window.addEventListener('pointerup', onChatbotDragEnd, { once: true });
}

function onChatbotDragMove(event) {
    if (!isDragging) return;

    const chatbot = document.getElementById('chatbotWindow');
    if (!chatbot) return;

    const x = event.clientX - dragOffsetX;
    const y = event.clientY - dragOffsetY;

    const maxX = window.innerWidth - chatbot.offsetWidth;
    const maxY = window.innerHeight - chatbot.offsetHeight;

    chatbot.style.left = `${Math.min(Math.max(0, x), maxX)}px`;
    chatbot.style.top = `${Math.min(Math.max(0, y), maxY)}px`;
}

function onChatbotDragEnd() {
    isDragging = false;
    window.removeEventListener('pointermove', onChatbotDragMove);
}

function initialize() {
    const mobileButton = document.getElementById('mobileMenuButton');
    if (mobileButton) mobileButton.addEventListener('click', toggleMobileMenu);

    const chatOpen = document.getElementById('chatToggle');
    if (chatOpen) chatOpen.addEventListener('click', toggleChatbot);

    const chatHandle = document.getElementById('chatbotHandle');
    if (chatHandle) chatHandle.addEventListener('pointerdown', onChatbotDragStart);

    const chatForm = document.getElementById('chatForm');
    if (chatForm) chatForm.addEventListener('submit', handleChatSubmit);
}

window.addEventListener('DOMContentLoaded', initialize);
