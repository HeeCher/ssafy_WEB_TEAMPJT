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

async function getChatAnswer(message) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question: message }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => null);
            const detail = error?.details ? ` (${error.details})` : '';
            return `${error?.error || 'AI 응답을 가져오는 중 문제가 발생했습니다.'}${detail}`;
        }

        const data = await response.json();
        return data.answer || 'AI 응답이 비어 있습니다. 다시 시도해 주세요.';
    } catch (error) {
        return '서버 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.';
    }
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

async function handleChatSubmit(event) {
    event.preventDefault();
    const input = document.getElementById('chatInput');
    if (!input) return;
    const message = input.value.trim();
    if (!message) return;
    appendChatMessage(message, 'user');
    input.value = '';
    appendChatMessage('AI가 응답 중입니다...', 'bot');

    const answer = await getChatAnswer(message);
    const history = document.getElementById('chatHistory');
    if (history && history.lastChild) {
        history.removeChild(history.lastChild);
    }

    appendChatMessage(answer, 'bot');
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
