// Управління станом учня в sessionStorage / localStorage
const STORAGE_KEY = 'et_lesson_6_data';

function getDefaultState() {
    return {
        studentName: '',
        studentClass: '6-А',
        startTime: Date.now(),
        times: {
            page1: 0,
            page2: 0,
            page3_sim: 0,
            page3_prac: 0,
            page4_test: 0
        },
        scores: {
            simulator: 0,   // макс 6 балів (3 завдання по 2 бали)
            practice: 0,    // макс 6 балів (3 завдання по 2 бали)
            test: 0         // макс 10 балів (10 питань по 1 балу)
        },
        simTasks: {
            t1: false,
            t2: false,
            t3: false
        },
        practiceCompleted: false,
        testCompleted: false,
        testAnswers: {}
    };
}

function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        const def = getDefaultState();
        saveState(def);
        return def;
    }
    try {
        return JSON.parse(raw);
    } catch (e) {
        const def = getDefaultState();
        saveState(def);
        return def;
    }
}

function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function resetState() {
    const def = getDefaultState();
    saveState(def);
    return def;
}

function formatSeconds(sec) {
    sec = Math.floor(sec);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Таймер активної сторінки
let pageEnterTimestamp = Date.now();
let currentPageKey = null;

function initPageTimer(pageKey, timerElementId) {
    currentPageKey = pageKey;
    pageEnterTimestamp = Date.now();
    const state = loadState();

    // Відображення ПІБ у шапці, якщо є
    const userBadge = document.getElementById('header-student-info');
    if (userBadge && state.studentName) {
        userBadge.textContent = `Учень: ${state.studentName} (${state.studentClass})`;
    }

    const timerEl = document.getElementById(timerElementId);
    if (timerEl) {
        setInterval(() => {
            const elapsedOnVisit = Math.floor((Date.now() - pageEnterTimestamp) / 1000);
            const totalPageSec = (state.times[pageKey] || 0) + elapsedOnVisit;
            timerEl.textContent = formatSeconds(totalPageSec);
        }, 500);
    }

    window.addEventListener('beforeunload', () => {
        commitCurrentPageTime();
    });
}

function commitCurrentPageTime() {
    if (!currentPageKey) return;
    const state = loadState();
    const elapsed = Math.floor((Date.now() - pageEnterTimestamp) / 1000);
    state.times[currentPageKey] = (state.times[currentPageKey] || 0) + elapsed;
    pageEnterTimestamp = Date.now();
    saveState(state);
}

// Конвертація 22 балів у 11-бальну шкільну оцінку
function convertToSchoolGrade(points22) {
    // 22 бали = 11 балів (ділимо на 2 з округленням)
    if (points22 <= 0) return 1;
    const grade = Math.round(points22 / 2);
    return Math.max(1, Math.min(11, grade));
}
